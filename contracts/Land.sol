// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract LandTokenization is ERC721, Ownable, ReentrancyGuard {
    // Counter for all minted plots (token IDs)
    uint256 public totalSupply;
    // Counter for land projects
    uint256 public landCounter;

    struct LandProject {
        uint256 landId;
        string landName;
        uint256 totalArea;     // e.g., 12000
        uint256 plotSize;      // e.g., 1000
        uint256 numPlots;      // totalArea / plotSize
        string imageHash;      // image reference or blank
        string description;
        string contactNumber;
        string location;
        uint256 basePrice;     // default price per plot
        bool active;
    }

    struct PlotInfo {
        uint256 landId;
        uint256 plotNumber;
        uint256 price;
        bool isFirstSale; // Track if this is first sale from owner
    }

    mapping(uint256 => LandProject) public landProjects; // landId => LandProject
    mapping(uint256 => PlotInfo) public plotDetails;     // tokenId => PlotInfo
    mapping(uint256 => uint256) public plotsMinted;      // landId => number minted
    mapping(uint256 => uint256) public resaleList;       // tokenId => resale price

    event LandCreated(uint256 indexed landId, string name, uint256 totalPlots);
    event PlotMinted(uint256 indexed landId, uint256 tokenId);
    event PlotSold(uint256 indexed tokenId, address buyer, uint256 price);
    event PlotListed(uint256 indexed tokenId, uint256 price);
    event PlotUnlisted(uint256 indexed tokenId);
    event PlotResold(uint256 indexed tokenId, address newOwner, uint256 price);
    event LandProjectDeactivated(uint256 indexed landId);

    constructor() ERC721("LandRegistry", "LND") Ownable(msg.sender) {}

    // Create a new land project
    function createLandProject(
        string memory _landName,
        uint256 _totalArea,
        uint256 _plotSize,
        string memory _imageHash,
        string memory _description,
        string memory _contactNumber,
        string memory _location,
        uint256 _basePrice
    ) external onlyOwner {
        require(_plotSize > 0 && _totalArea > 0, "Invalid area");
        require(_totalArea >= _plotSize, "Plot > total area");
        require(_basePrice > 0, "Price must be > 0");
        require(bytes(_landName).length > 0, "Name required");
        require(bytes(_location).length > 0, "Location required");

        uint256 _numPlots = _totalArea / _plotSize;
        landCounter++;

        landProjects[landCounter] = LandProject({
            landId: landCounter,
            landName: _landName,
            totalArea: _totalArea,
            plotSize: _plotSize,
            numPlots: _numPlots,
            imageHash: _imageHash,
            description: _description,
            contactNumber: _contactNumber,
            location: _location,
            basePrice: _basePrice,
            active: true
        });

        emit LandCreated(landCounter, _landName, _numPlots);
    }

    // Mint a plot for a given land project (onlyOwner)
    // Mint a plot for a given land project (onlyOwner)
    function mintPlot(uint256 _landId) external onlyOwner {
        LandProject storage land = landProjects[_landId];
        require(land.active, "Invalid land");
        require(plotsMinted[_landId] < land.numPlots, "All plots minted");

        uint256 tokenId = ++totalSupply;
        uint256 plotNumber = ++plotsMinted[_landId];

        _safeMint(address(this), tokenId);  // ✅ CHANGED: Mint to contract, not owner
        plotDetails[tokenId] = PlotInfo({
            landId: _landId,
            plotNumber: plotNumber,
            price: land.basePrice,
            isFirstSale: true
        });

        emit PlotMinted(_landId, tokenId);
    }

    // Buy an available plot (primary sale from owner)
    function buyPlot(uint256 tokenId) external payable nonReentrant {
        PlotInfo storage plot = plotDetails[tokenId];
        require(_ownerOf(tokenId) != address(0), "Invalid plot");
        require(plot.isFirstSale, "Not available for primary sale");
        require(ownerOf(tokenId) == owner(), "Not owned by contract owner");
        require(msg.value >= plot.price, "Insufficient amount");

        address seller = owner();
        uint256 price = plot.price;
        
        // Mark as sold before transfer (CEI pattern)
        plot.isFirstSale = false;
        
        // Transfer NFT
        _transfer(seller, msg.sender, tokenId);
        
        // Refund excess payment
        uint256 excess = msg.value - price;
        if (excess > 0) {
            payable(msg.sender).transfer(excess);
        }
        
        // Pay seller
        payable(seller).transfer(price);
        emit PlotSold(tokenId, msg.sender, price);
    }

    // List a plot for resale
    function listForSale(uint256 tokenId, uint256 price) external {
        require(_ownerOf(tokenId) != address(0), "Invalid plot");
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        require(!plotDetails[tokenId].isFirstSale, "Use buyPlot for first sale");
        require(price > 0, "Invalid price");
        resaleList[tokenId] = price;
        emit PlotListed(tokenId, price);
    }

    // Unlist a plot from resale
    function unlistFromSale(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        require(resaleList[tokenId] > 0, "Not listed");
        delete resaleList[tokenId];
        emit PlotUnlisted(tokenId);
    }

    // Buy a resold plot
    function buyResale(uint256 tokenId) external payable nonReentrant {
        uint256 price = resaleList[tokenId];
        require(price > 0, "Not listed");
        require(msg.value >= price, "Insufficient funds");
        require(_ownerOf(tokenId) != address(0), "Invalid plot");

        address seller = ownerOf(tokenId);
        require(seller != msg.sender, "Cannot buy own plot");
        
        // Clear listing before transfer (CEI pattern)
        delete resaleList[tokenId];
        
        // Transfer NFT
        _transfer(seller, msg.sender, tokenId);
        
        // Refund excess payment
        uint256 excess = msg.value - price;
        if (excess > 0) {
            payable(msg.sender).transfer(excess);
        }
        
        // Pay seller
        payable(seller).transfer(price);
        emit PlotResold(tokenId, msg.sender, price);
    }

    // View details for a land project
    function getLandInfo(uint256 _landId) external view returns (LandProject memory) {
        return landProjects[_landId];
    }

    // View details for a plot
    function getPlotInfo(uint256 tokenId) external view returns (PlotInfo memory) {
        require(_ownerOf(tokenId) != address(0), "Invalid plot");
        return plotDetails[tokenId];
    }

    // Get resale price for a plot
    function getResalePrice(uint256 tokenId) external view returns (uint256) {
        return resaleList[tokenId];
    }

    // Check if plot is available for primary sale
    function isAvailableForPrimarySale(uint256 tokenId) external view returns (bool) {
        if (_ownerOf(tokenId) == address(0)) return false;
        return plotDetails[tokenId].isFirstSale && ownerOf(tokenId) == owner();
    }

    // Deactivate a land project
    function deactivateLandProject(uint256 _landId) external onlyOwner {
        require(landProjects[_landId].active, "Already inactive");
        landProjects[_landId].active = false;
        emit LandProjectDeactivated(_landId);
    }

    // Get total plots minted for a land project
    function getPlotsMinted(uint256 _landId) external view returns (uint256) {
        return plotsMinted[_landId];
    }

    // Withdraw contract balance (for safety)
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance");
        payable(owner()).transfer(balance);
    }

    // Allow contract to receive ETH
    receive() external payable {}
}
