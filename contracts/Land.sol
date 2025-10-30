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

    struct Listing {
        address seller;
        uint256 price;
    }

    mapping(uint256 => LandProject) public landProjects; // landId => LandProject
    mapping(uint256 => PlotInfo) public plotDetails;     // tokenId => PlotInfo
    mapping(uint256 => uint256) public plotsMinted;      // landId => number minted
    mapping(uint256 => Listing) public resaleListing;    // tokenId => Listing (seller + price)
    mapping(uint256 => bool) public isProjectOnHold;     // landId => hold status

    event LandCreated(uint256 indexed landId, string name, uint256 totalPlots);
    event PlotMinted(uint256 indexed landId, uint256 tokenId);
    event PlotSold(uint256 indexed tokenId, address indexed buyer, uint256 price);
    event PlotListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event PlotUnlisted(uint256 indexed tokenId, address indexed seller);
    event PlotResold(uint256 indexed tokenId, address indexed newOwner, uint256 price);
    event LandProjectDeactivated(uint256 indexed landId);
    event LandProjectHeld(uint256 indexed landId);
    event LandProjectUnheld(uint256 indexed landId);
    event LandProjectDeleted(uint256 indexed landId);
    event Withdrawn(address indexed to, uint256 amount);

    constructor() ERC721("LandRegistry", "LND") Ownable(msg.sender) {}

    // ✅ FIX: Added modifier to check land project exists
    modifier landExists(uint256 _landId) {
        require(landProjects[_landId].landId != 0, "Land project does not exist");
        _;
    }

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

        require(_totalArea % _plotSize == 0, "Area not evenly divisible by plot size");

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

    // Mint a plot to the contract (escrow)
    function mintPlot(uint256 _landId) external onlyOwner landExists(_landId) {
        LandProject storage land = landProjects[_landId];
        require(land.active, "Land project not active");
        require(plotsMinted[_landId] < land.numPlots, "All plots minted");

        uint256 tokenId = ++totalSupply;
        uint256 plotNumber = ++plotsMinted[_landId];

        // Mint to contract (escrow). Use _mint to avoid ERC721Receiver requirement.
        _mint(address(this), tokenId);

        plotDetails[tokenId] = PlotInfo({
            landId: _landId,
            plotNumber: plotNumber,
            price: land.basePrice,
            isFirstSale: true
        });

        emit PlotMinted(_landId, tokenId);
    }

    // Batch mint plots to the contract (gas efficient for multiple plots)
    function mintPlotBatch(uint256 _landId, uint256 quantity) external onlyOwner landExists(_landId) {
        require(quantity > 0, "Quantity must be > 0");
        require(quantity <= 50, "Max 50 plots per batch"); // Prevent gas limit issues
        
        LandProject storage land = landProjects[_landId];
        require(land.active, "Land project not active");
        require(plotsMinted[_landId] + quantity <= land.numPlots, "Exceeds available plots");

        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = ++totalSupply;
            uint256 plotNumber = ++plotsMinted[_landId];

            _mint(address(this), tokenId);

            plotDetails[tokenId] = PlotInfo({
                landId: _landId,
                plotNumber: plotNumber,
                price: land.basePrice,
                isFirstSale: true
            });

            emit PlotMinted(_landId, tokenId);
        }
    }

    // Buy primary sale plot (contract-owned)
    function buyPlot(uint256 tokenId) external payable nonReentrant {
        require(_ownerOf(tokenId) != address(0), "Invalid plot");
        PlotInfo storage plot = plotDetails[tokenId];
        require(plot.isFirstSale, "Not available for primary sale");
        require(ownerOf(tokenId) == address(this), "Not owned by contract");
        require(!isProjectOnHold[plot.landId], "Project is on hold");
        require(msg.value >= plot.price, "Insufficient amount");
        require(msg.sender != owner(), "Owner cannot buy their own plots");

        uint256 price = plot.price;
        address sellerAddr = owner(); // contract owner receives payment

        // CEI
        plot.isFirstSale = false;

        // Transfer NFT to buyer
        _transfer(address(this), msg.sender, tokenId);

        // Pay seller using call (safer than transfer)
        (bool sent, ) = payable(sellerAddr).call{value: price}("");
        require(sent, "Payment to seller failed");

        // Refund excess
        uint256 excess = msg.value - price;
        if (excess > 0) {
            (bool refunded, ) = payable(msg.sender).call{value: excess}("");
            require(refunded, "Refund failed");
        }

        emit PlotSold(tokenId, msg.sender, price);
    }

    // List a plot for resale (seller must be current owner)
    function listForSale(uint256 tokenId, uint256 price) external {
        require(_ownerOf(tokenId) != address(0), "Invalid plot");
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        require(!plotDetails[tokenId].isFirstSale, "Use buyPlot for first sale");
        require(price > 0, "Invalid price");
        require(resaleListing[tokenId].price == 0, "Already listed");

        resaleListing[tokenId] = Listing({ seller: msg.sender, price: price });
        emit PlotListed(tokenId, msg.sender, price);
    }

    // Unlist a plot from resale
    function unlistFromSale(uint256 tokenId) external {
        Listing memory listing = resaleListing[tokenId];
        require(listing.price > 0, "Not listed");
        require(listing.seller == msg.sender, "Not lister");
        delete resaleListing[tokenId];
        emit PlotUnlisted(tokenId, msg.sender);
    }

    // Buy a resale plot
    function buyResale(uint256 tokenId) external payable nonReentrant {
        Listing memory listing = resaleListing[tokenId];
        uint256 price = listing.price;
        require(price > 0, "Not listed");
        address sellerAddr = listing.seller;
        require(sellerAddr == ownerOf(tokenId), "Seller not current owner");
        require(sellerAddr != msg.sender, "Cannot buy your own plot");
        require(msg.value >= price, "Insufficient funds");
        require(_ownerOf(tokenId) != address(0), "Invalid plot");
        
        PlotInfo memory plot = plotDetails[tokenId];
        require(!isProjectOnHold[plot.landId], "Project is on hold");

        // Clear listing (CEI)
        delete resaleListing[tokenId];

        // Transfer NFT
        _transfer(sellerAddr, msg.sender, tokenId);

        // Pay seller using call
        (bool sent, ) = payable(sellerAddr).call{value: price}("");
        require(sent, "Payment to seller failed");

        // Refund excess
        uint256 excess = msg.value - price;
        if (excess > 0) {
            (bool refunded, ) = payable(msg.sender).call{value: excess}("");
            require(refunded, "Refund failed");
        }

        emit PlotResold(tokenId, msg.sender, price);
    }

    // Get land info
    function getLandInfo(uint256 _landId) external view landExists(_landId) returns (LandProject memory) {
        return landProjects[_landId];
    }

    // View plot details
    function getPlotInfo(uint256 tokenId) external view returns (PlotInfo memory) {
        require(_ownerOf(tokenId) != address(0), "Invalid plot");
        return plotDetails[tokenId];
    }

    // Get resale listing
    function getResaleListing(uint256 tokenId) external view returns (address seller, uint256 price) {
        Listing memory l = resaleListing[tokenId];
        return (l.seller, l.price);
    }

    // Is token available for primary sale?
    function isAvailableForPrimarySale(uint256 tokenId) external view returns (bool) {
        if (_ownerOf(tokenId) == address(0)) return false;
        return plotDetails[tokenId].isFirstSale && ownerOf(tokenId) == address(this);
    }

    // Deactivate a land project
    function deactivateLandProject(uint256 _landId) external onlyOwner landExists(_landId) {
        require(landProjects[_landId].active, "Already inactive");
        landProjects[_landId].active = false;
        emit LandProjectDeactivated(_landId);
    }

    // Hold a land project (prevent buying)
    function holdProject(uint256 _landId) external onlyOwner landExists(_landId) {
        require(!isProjectOnHold[_landId], "Already on hold");
        isProjectOnHold[_landId] = true;
        emit LandProjectHeld(_landId);
    }

    // Unhold a land project (allow buying)
    function unholdProject(uint256 _landId) external onlyOwner landExists(_landId) {
        require(isProjectOnHold[_landId], "Not on hold");
        isProjectOnHold[_landId] = false;
        emit LandProjectUnheld(_landId);
    }

    // Delete a land project (only if no plots minted)
    function deleteProject(uint256 _landId) external onlyOwner landExists(_landId) {
        require(plotsMinted[_landId] == 0, "Cannot delete project with minted plots");
        delete landProjects[_landId];
        delete plotsMinted[_landId];
        delete isProjectOnHold[_landId];
        emit LandProjectDeleted(_landId);
    }

    // Get total plots minted for a land project
    function getPlotsMinted(uint256 _landId) external view returns (uint256) {
        return plotsMinted[_landId];
    }

    // Withdraw contract balance to owner
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance");

        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");

        emit Withdrawn(owner(), balance);
    }

    // Override _update to clear stale listings when NFT is transferred
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = super._update(to, tokenId, auth);
        
        // Clear any resale listing when token is transferred
        // This prevents stale listings after direct transfers
        if (resaleListing[tokenId].price > 0) {
            delete resaleListing[tokenId];
            emit PlotUnlisted(tokenId, from);
        }
        
        return from;
    }

    // Allow contract to receive ETH
    receive() external payable {}
}
