import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { holdProject, unholdProject, deleteProject, isProjectOnHold } from "@/lib/blockchain";
import { toast } from "react-toastify";
import { Trash2, PauseCircle, PlayCircle, AlertCircle } from "lucide-react";
import { LandProject } from "@/components/LandProjectCard";

interface ManageProjectsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: LandProject[];
  onUpdate: () => void;
}

interface ProjectWithHoldStatus extends LandProject {
  isOnHold: boolean;
}

export function ManageProjectsModal({
  open,
  onOpenChange,
  projects,
  onUpdate,
}: ManageProjectsModalProps) {
  const [projectsWithStatus, setProjectsWithStatus] = useState<ProjectWithHoldStatus[]>([]);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchHoldStatus = async () => {
      const projectsData = await Promise.all(
        projects.map(async (project) => {
          const onHold = await isProjectOnHold(project.id);
          return {
            ...project,
            isOnHold: onHold,
          };
        })
      );
      setProjectsWithStatus(projectsData);
    };

    if (open && projects.length > 0) {
      fetchHoldStatus();
    }
  }, [open, projects]);

  const handleHoldToggle = async (id: number, currentlyOnHold: boolean) => {
    const key = `hold-${id}`;
    setLoading({ ...loading, [key]: true });

    try {
      if (currentlyOnHold) {
        await unholdProject(id);
        toast.success("Project unheld successfully! Plots are now buyable.");
      } else {
        await holdProject(id);
        toast.success("Project held successfully! Plots cannot be bought.");
      }
      
      // Update local state
      setProjectsWithStatus((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, isOnHold: !currentlyOnHold } : p
        )
      );
      
      onUpdate();
    } catch (error: any) {
      console.error("Error toggling hold:", error);
      toast.error(error.message || "Failed to toggle hold status");
    } finally {
      setLoading({ ...loading, [key]: false });
    }
  };

  const handleDelete = async (id: number, plotsMinted: number) => {
    if (plotsMinted > 0) {
      toast.error("Cannot delete project with minted plots");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this project? This action cannot be undone."
    );

    if (!confirmed) return;

    const key = `delete-${id}`;
    setLoading({ ...loading, [key]: true });

    try {
      await deleteProject(id);
      toast.success("Project deleted successfully!");
      
      // Remove from local state
      setProjectsWithStatus((prev) => prev.filter((p) => p.id !== id));
      
      onUpdate();
    } catch (error: any) {
      console.error("Error deleting project:", error);
      toast.error(error.message || "Failed to delete project");
    } finally {
      setLoading({ ...loading, [key]: false });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Manage Projects</DialogTitle>
          <DialogDescription>
            Hold projects to prevent buying, or delete projects without minted plots
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {projectsWithStatus.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No projects found</p>
            </div>
          ) : (
            projectsWithStatus.map((project) => (
              <div
                key={project.id.toString()}
                className={`border rounded-lg p-4 ${
                  project.isOnHold ? "bg-yellow-50 border-yellow-300" : "bg-white"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{project.name}</h3>
                      {project.isOnHold && (
                        <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full font-medium">
                          ON HOLD
                        </span>
                      )}
                      {!project.active && (
                        <span className="px-2 py-1 bg-gray-200 text-gray-800 text-xs rounded-full font-medium">
                          INACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {project.location}
                    </p>
                    <div className="mt-2 text-sm space-y-1">
                      <p>
                        <span className="font-medium">Plots:</span> {project.numPlots}{" "}
                        <span className="text-muted-foreground">
                          ({project.plotsMinted} minted)
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">Base Price:</span>{" "}
                        {project.basePrice} ETH
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant={project.isOnHold ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleHoldToggle(project.id, project.isOnHold)}
                      disabled={loading[`hold-${project.id}`]}
                      className={project.isOnHold ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                      {loading[`hold-${project.id}`] ? (
                        "Processing..."
                      ) : project.isOnHold ? (
                        <>
                          <PlayCircle className="w-4 h-4 mr-1" />
                          Unhold
                        </>
                      ) : (
                        <>
                          <PauseCircle className="w-4 h-4 mr-1" />
                          Hold
                        </>
                      )}
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(project.id, project.plotsMinted)}
                      disabled={
                        project.plotsMinted > 0 || loading[`delete-${project.id}`]
                      }
                      title={
                        project.plotsMinted > 0
                          ? "Cannot delete project with minted plots"
                          : "Delete project"
                      }
                    >
                      {loading[`delete-${project.id}`] ? (
                        "Deleting..."
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {project.isOnHold && (
                  <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-800">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    This project is on hold. Users cannot buy plots until you unhold it.
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
