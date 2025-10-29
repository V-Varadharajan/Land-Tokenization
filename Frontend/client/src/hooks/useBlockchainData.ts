import { useState, useEffect } from "react";
import {
  getAllLandProjects,
  getLandProject,
  getPlotsMinted,
  getPlotInfo,
  getPlotOwner,
  getResalePrice,
  isAvailableForPrimarySale,
  getTotalSupply,
  getUserPlots,
  weiToEther,
  type LandProject as BlockchainLandProject,
  type PlotInfo as BlockchainPlotInfo,
} from "@/lib/blockchain";
import { LandProject } from "@/components/LandProjectCard";
import { Plot } from "@/components/PlotGrid";

export function useAllLandProjects() {
  const [projects, setProjects] = useState<LandProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const blockchainProjects = await getAllLandProjects();
      
      const formattedProjects: LandProject[] = await Promise.all(
        blockchainProjects.map(async (project: BlockchainLandProject) => {
          const plotsMinted = await getPlotsMinted(Number(project.landId));
          return {
            id: Number(project.landId),
            name: project.landName,
            location: project.location,
            totalArea: Number(project.totalArea),
            plotSize: Number(project.plotSize),
            numPlots: Number(project.numPlots),
            plotsMinted: plotsMinted,
            basePrice: weiToEther(project.basePrice),
            imageUrl: project.imageHash || "",
            contactNumber: project.contactNumber,
            active: project.active,
          };
        })
      );
      
      setProjects(formattedProjects);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching projects:", err);
      setError(err.message || "Failed to fetch land projects");
    } finally {
      setLoading(false);
    }
  };

  return { projects, loading, error, refetch: fetchProjects };
}

export function useLandProject(landId: number) {
  const [project, setProject] = useState<LandProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (landId) {
      fetchProject();
    }
  }, [landId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const blockchainProject = await getLandProject(landId);
      const plotsMinted = await getPlotsMinted(landId);
      
      const formattedProject: LandProject = {
        id: Number(blockchainProject.landId),
        name: blockchainProject.landName,
        location: blockchainProject.location,
        totalArea: Number(blockchainProject.totalArea),
        plotSize: Number(blockchainProject.plotSize),
        numPlots: Number(blockchainProject.numPlots),
        plotsMinted: plotsMinted,
        basePrice: weiToEther(blockchainProject.basePrice),
        imageUrl: blockchainProject.imageHash || "",
        contactNumber: blockchainProject.contactNumber,
        active: blockchainProject.active,
      };
      
      setProject(formattedProject);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching project:", err);
      setError(err.message || "Failed to fetch land project");
    } finally {
      setLoading(false);
    }
  };

  return { project, loading, error, refetch: fetchProject };
}

export function useProjectPlots(landId: number, numPlots: number, contractOwnerAddress: string) {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (landId && numPlots > 0) {
      fetchPlots();
    }
  }, [landId, numPlots]);

  const fetchPlots = async () => {
    try {
      setLoading(true);
      const totalSupply = await getTotalSupply();
      const allPlots: Plot[] = [];
      
      for (let tokenId = 1; tokenId <= totalSupply; tokenId++) {
        try {
          const plotInfo = await getPlotInfo(tokenId);
          
          if (Number(plotInfo.landId) === landId) {
            const owner = await getPlotOwner(tokenId);
            const resalePrice = await getResalePrice(tokenId);
            const isPrimarySale = await isAvailableForPrimarySale(tokenId);
            
            let status: "available" | "listed" | "sold";
            if (isPrimarySale && owner.toLowerCase() === contractOwnerAddress.toLowerCase()) {
              status = "available";
            } else if (Number(resalePrice) > 0) {
              status = "listed";
            } else {
              status = "sold";
            }
            
            allPlots.push({
              tokenId,
              plotNumber: Number(plotInfo.plotNumber),
              status,
              price: weiToEther(plotInfo.price),
              owner,
              resalePrice: Number(resalePrice) > 0 ? weiToEther(resalePrice) : undefined,
            });
          }
        } catch (err) {
          // Token might not exist yet
        }
      }
      
      setPlots(allPlots.sort((a, b) => a.plotNumber - b.plotNumber));
      setError(null);
    } catch (err: any) {
      console.error("Error fetching plots:", err);
      setError(err.message || "Failed to fetch plots");
    } finally {
      setLoading(false);
    }
  };

  return { plots, loading, error, refetch: fetchPlots };
}

export function useUserOwnedPlots(userAddress: string | null) {
  const [plots, setPlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userAddress) {
      fetchUserPlots();
    } else {
      setPlots([]);
      setLoading(false);
    }
  }, [userAddress]);

  const fetchUserPlots = async () => {
    if (!userAddress) return;
    
    try {
      setLoading(true);
      const tokenIds = await getUserPlots(userAddress);
      
      const plotsData = await Promise.all(
        tokenIds.map(async (tokenId) => {
          const plotInfo = await getPlotInfo(tokenId);
          const landProject = await getLandProject(Number(plotInfo.landId));
          const resalePrice = await getResalePrice(tokenId);
          
          return {
            tokenId,
            plotNumber: Number(plotInfo.plotNumber),
            landName: landProject.landName,
            landId: Number(plotInfo.landId),
            purchasePrice: weiToEther(plotInfo.price),
            isListed: Number(resalePrice) > 0,
            listingPrice: Number(resalePrice) > 0 ? weiToEther(resalePrice) : undefined,
          };
        })
      );
      
      setPlots(plotsData);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching user plots:", err);
      setError(err.message || "Failed to fetch your plots");
    } finally {
      setLoading(false);
    }
  };

  return { plots, loading, error, refetch: fetchUserPlots };
}

export function useBlockchainStats() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalPlots: 0,
    plotsSold: 0,
    totalVolume: "0 ETH",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const projects = await getAllLandProjects();
      const totalSupply = await getTotalSupply();
      
      let soldCount = 0;
      for (let tokenId = 1; tokenId <= totalSupply; tokenId++) {
        try {
          const isPrimarySale = await isAvailableForPrimarySale(tokenId);
          if (!isPrimarySale) {
            soldCount++;
          }
        } catch (err) {
          // Token might not exist
        }
      }
      
      setStats({
        totalProjects: projects.length,
        totalPlots: totalSupply,
        plotsSold: soldCount,
        totalVolume: "0 ETH", // Would need to track this via events
      });
      setError(null);
    } catch (err: any) {
      console.error("Error fetching stats:", err);
      setError(err.message || "Failed to fetch statistics");
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, error, refetch: fetchStats };
}
