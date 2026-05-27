"use client";

import React, { useState, useEffect } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { 
  Building2, Sliders, Compass, FolderTree, ChevronLeft, 
  PlusCircle, Trash2, Move, CheckCircle2, Link2, Bookmark, 
  RefreshCw, UploadCloud, Info 
} from "lucide-react";
import { db } from "@/lib/configs/firebase"; 
import { writeBatch, doc, collection, Firestore } from "firebase/firestore";

// --- TYPES & INTERFACES ---
interface Vector3 { x: number; y: number; z: number; }
interface ActiveNode { id: string; placardName: string; position: Vector3; rotationY: number; }
type EditorMode = "spawn" | "link" | "placard" | "hierarchy" | "building" | "batch";

interface TargetRoomSchema {
  roomName: string;
  side: string;
}

interface TargetNodeSchema {
  nodeID: string;
  floor: string;
  category: string;
  posX: number;
  posY: number;
  posZ: number;
  neighbors: string[];
  rooms: TargetRoomSchema[];
}

interface UnityBatchManifest {
  campusTarget: string;
  buildingName: string;
  nodes: TargetNodeSchema[];
}

declare global {
  interface Window {
    onNodeSelectedFromUnity?: (id: string, name: string, x: number, y: number, z: number, rotY?: number) => void;
    onHierarchyTreeGeneratedFromUnity?: (hierarchyString: string) => void;
    onBatchManifestGeneratedFromUnity?: (jsonManifest: string) => void;
  }
}

export default function UnifiedMapEditorPage() {
  const [activeMode, setActiveMode] = useState<EditorMode>("spawn");
  const [selectedNode, setSelectedNode] = useState<ActiveNode | null>(null);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState("Gd_1");
  const [selectedFloor, setSelectedFloor] = useState("2ndFloor");
  const [selectedCategory, setSelectedCategory] = useState("Hallway");
  const [textureUrl, setTextureUrl] = useState("");
  const [linkingSourceId, setLinkingSourceId] = useState<string | null>(null);
  const [nodeNeighbors, setNodeNeighbors] = useState<string[]>(["Gd_1_2ndFloor_Hallway_Node_02", "Gd_1_2ndFloor_Hallway_Node_04"]);
  const [placardRoomName, setPlacardRoomName] = useState("");
  const [placardSide, setPlacardSide] = useState("Left");
  const [useNodePosition, setUseNodePosition] = useState(true);
  const [attachedRooms, setAttachedRooms] = useState([
    { name: "RESEARCH LABORATORY", side: "Left" },
    { name: "CHEMISTRY LABORATORY 2", side: "Right" }
  ]);
  const [liveHierarchyText, setLiveHierarchyText] = useState("Awaiting canvas tree query stream update...");
  const [newBuildingName, setNewBuildingName] = useState("");
  const [floorPlanType, setFloorPlanType] = useState("4-floors");
  const [buildingOffset, setBuildingOffset] = useState({ x: 0, y: 0, z: 0 });
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCampusTarget, setSelectedCampusTarget] = useState("MainCampus");

  // --- UNITY WEBGL CONTEXT ---
  const { unityProvider, isLoaded, sendMessage } = useUnityContext({
    loaderUrl: "https://firebasestorage.googleapis.com/v0/b/arise-authentication-fda17.firebasestorage.app/o/unity-build%2Fsdca_virtual_tour.loader.js?alt=media",
    dataUrl: "https://firebasestorage.googleapis.com/v0/b/arise-authentication-fda17.firebasestorage.app/o/unity-build%2Fsdca_virtual_tour.data?alt=media",
    frameworkUrl: "https://firebasestorage.googleapis.com/v0/b/arise-authentication-fda17.firebasestorage.app/o/unity-build%2Fsdca_virtual_tour.framework.js?alt=media",
    codeUrl: "https://firebasestorage.googleapis.com/v0/b/arise-authentication-fda17.firebasestorage.app/o/unity-build%2Fsdca_virtual_tour.wasm?alt=media",
  });

  // --- BOOT INTO GLOBAL NODE GRAPH VIEW ON LOAD (Admin/CMS) ---
  // This fires once Unity finishes mounting and ensures the admin map editor
  // always opens in the bird's eye global node graph view, not panoramic mode.
  useEffect(() => {
    if (isLoaded) {
      sendMessage("NavigationTest", "SetEditorViewMode", "global");
    }
  }, [isLoaded]);

  // --- BIDIRECTIONAL COMMUNICATION BRIDGE ---
  useEffect(() => {
    window.onNodeSelectedFromUnity = (id, name, x, y, z, rotY = 0) => {
      setActiveNodeId(id);
      setSelectedNode({
        id, placardName: name,
        position: { x: parseFloat(x.toFixed(3)), y: parseFloat(y.toFixed(3)), z: parseFloat(z.toFixed(3)) },
        rotationY: parseFloat(rotY.toFixed(2))
      });
    };

    window.onHierarchyTreeGeneratedFromUnity = (hierarchyString) => {
      setLiveHierarchyText(hierarchyString);
    };

    window.onBatchManifestGeneratedFromUnity = async (jsonManifest) => {
      try {
        setIsUploading(true);
        const manifest = JSON.parse(jsonManifest) as UnityBatchManifest;
        const collectionName = manifest.campusTarget === "MainCampus" ? "Nodes_Main" : "Nodes_Digital";
        
        let batch = writeBatch(db as Firestore);
        let operationsCounter = 0;

        for (const node of manifest.nodes) {
          const docRef = doc(collection(db as Firestore, collectionName), node.nodeID);
          batch.set(docRef, {
            nodeID: node.nodeID,
            campus: manifest.campusTarget,
            building: manifest.buildingName,
            floor: node.floor,
            category: node.category,
            posX: Number(node.posX),
            posY: Number(node.posY),
            posZ: Number(node.posZ),
            neighbors: node.neighbors,
            rooms: node.rooms.map((r) => ({
              roomName: r.roomName, side: r.side, building: manifest.buildingName, campus: manifest.campusTarget
            }))
          });
          
          operationsCounter++;
          if (operationsCounter % 400 === 0) {
            await batch.commit();
            batch = writeBatch(db as Firestore);
          }
        }

        if (operationsCounter % 400 !== 0) await batch.commit();
        alert(`🎉 Batch success! Synchronized ${operationsCounter} node graphs to Firestore.`);
      } catch (err) {
        console.error(err);
        alert("Batch pipeline transaction write error exceptions thrown.");
      } finally {
        setIsUploading(false);
      }
    };

    return () => {
      window.onNodeSelectedFromUnity = undefined;
      window.onHierarchyTreeGeneratedFromUnity = undefined;
      window.onBatchManifestGeneratedFromUnity = undefined;
    };
  }, []);

  const updateUnityTransform = (property: "x" | "y" | "z" | "rotationY", value: number) => {
    if (!selectedNode) return;
    const updated = property === "rotationY" 
      ? { ...selectedNode, rotationY: value }
      : { ...selectedNode, position: { ...selectedNode.position, [property]: value } };
    
    setSelectedNode(updated);
    if (isLoaded) {
      sendMessage("NodeManager", "WebUpdateActiveNodeTransform", JSON.stringify({ id: selectedNode.id, ...updated.position, rotationY: updated.rotationY }));
    }
  };

  return (
    <div className="h-full w-full bg-[#0e0e11] text-white font-sans overflow-hidden flex select-none">

      <div className="flex-1 h-full relative z-0 bg-neutral-950 flex flex-col overflow-hidden">
        
        {/* SUB-HEADER & MODE SELECTOR TOGGLES */}
        <div className="h-14 border-b border-neutral-900 px-6 flex justify-between items-center bg-[#09090b]/40 backdrop-blur z-10 shrink-0">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
            <button className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[10px] font-black uppercase px-3 h-8 rounded-lg flex items-center gap-1.5 text-neutral-300 shrink-0">
              <ChevronLeft size={12} /> Exit
            </button>
            <div className="h-4 w-[1px] bg-neutral-800 shrink-0" />
            <div className="flex gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-900 shrink-0">
              {(["spawn", "link", "placard", "hierarchy", "building", "batch"] as EditorMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setActiveMode(mode)}
                  className={`px-3 h-6 rounded text-[9px] font-black uppercase tracking-wider transition-all ${
                    activeMode === mode 
                      ? "bg-rose-600/10 text-rose-500 border border-rose-500/20 font-black" 
                      : "text-neutral-500 hover:text-neutral-300 font-bold"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
          
          <div className="text-[10px] tracking-wider font-mono font-bold uppercase flex items-center gap-3 shrink-0">
            <span className="text-neutral-500 hidden sm:inline">ENGINE LAYER:</span>
            <span className={isLoaded
              ? "text-emerald-400 bg-emerald-950/20 px-2.5 py-1 rounded-md border border-emerald-900/30"
              : "text-amber-400 animate-pulse bg-amber-950/20 px-2.5 py-1 rounded-md border border-amber-900/30"
            }>
              {isLoaded ? "WebGL Active" : "Mounting Mesh..."}
            </span>
          </div>
        </div>

        {/* WORKSPACE: 3D CANVAS + RIGHT PANEL */}
        <div className="flex-1 w-full flex overflow-hidden relative">
          
          {/* UNITY CANVAS — min-w-0 prevents flex overflow pushing right panel off screen */}
          <div className="flex-1 min-w-0 h-full bg-[#111115] relative overflow-hidden">
            <Unity unityProvider={unityProvider} className="w-full h-full block bg-neutral-950" />
          </div>

          {/* RIGHT CONFIGURATION SIDEBAR */}
          <div className="w-[340px] h-full bg-[#09090b] border-l border-neutral-900 flex flex-col shrink-0 relative z-10">
            
            {/* SPAWN / EDIT */}
            {activeMode === "spawn" && (
              <>
                <div className="p-4 border-b border-neutral-900 bg-neutral-950/30 flex items-center gap-2 shrink-0">
                  <div className="p-1.5 bg-blue-600 rounded text-white"><PlusCircle size={13} /></div>
                  <div>
                    <h2 className="text-xs font-black tracking-wider uppercase text-neutral-100">Spawn / Edit</h2>
                    <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-tight">Configure node placement</p>
                  </div>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs scrollbar-thin">
                  <div className="flex justify-end">
                    <button
                      onClick={() => isLoaded && sendMessage("NodeManager", "WebAddNodeToGraph", JSON.stringify({ building: selectedBuilding, floor: selectedFloor, category: selectedCategory }))}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-[10px] font-black uppercase flex items-center gap-1 shadow-md"
                    >
                      <PlusCircle size={11} /> Spawn New Node
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider block mb-1">Node Name ID</label>
                      <input type="text" readOnly className="w-full bg-neutral-900/50 border border-neutral-800 rounded h-9 px-3 text-xs font-mono text-neutral-400 outline-none select-all" value={selectedNode ? selectedNode.id : "No Node Selected"} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider block mb-1">Building</label>
                        <select className="w-full bg-neutral-900/50 border border-neutral-800 rounded h-9 px-2 text-xs text-neutral-300 outline-none" value={selectedBuilding} onChange={(e) => setSelectedBuilding(e.target.value)}>
                          <option value="Gd_1">Gd_1 (Main Complex)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider block mb-1">Floor</label>
                        <select className="w-full bg-neutral-900/50 border border-neutral-800 rounded h-9 px-2 text-xs text-neutral-300 outline-none" value={selectedFloor} onChange={(e) => setSelectedFloor(e.target.value)}>
                          <option value="1stFloor">1st Floor</option>
                          <option value="2ndFloor">2nd Floor</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider block mb-1">Category Type</label>
                      <select className="w-full bg-neutral-900/50 border border-neutral-800 rounded h-9 px-3 text-xs text-neutral-300 outline-none" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                        <option value="Hallway">Hallway Corridor</option>
                        <option value="Stairs">Stairs Node Point</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1"><Move size={11}/> Position Vectors</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(["x", "y", "z"] as const).map((axis) => (
                          <div key={axis} className="bg-neutral-900/50 border border-neutral-800 rounded px-2 py-1">
                            <span className="text-[9px] font-bold uppercase text-neutral-500 block">{axis}-axis</span>
                            <input type="number" step="0.01" className="bg-transparent outline-none font-mono font-bold text-xs text-neutral-200 w-full mt-0.5" value={selectedNode ? selectedNode.position[axis] : 0} onChange={(e) => updateUnityTransform(axis, parseFloat(e.target.value) || 0)} disabled={!selectedNode} />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block mb-1 flex items-center justify-between">
                        <span>Rotation Y Angle</span>
                        <span className="font-mono text-neutral-300 font-bold">{selectedNode?.rotationY || 0}°</span>
                      </label>
                      <input type="range" min="0" max="360" className="w-full accent-blue-500 h-1 bg-neutral-800 rounded cursor-pointer" value={selectedNode?.rotationY || 0} onChange={(e) => updateUnityTransform("rotationY", parseInt(e.target.value) || 0)} disabled={!selectedNode} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider block mb-1">3D Panorama Image Path</label>
                      <input type="text" placeholder="images/panoramas/room.jpg" className="w-full bg-neutral-900/50 border border-neutral-800 rounded h-9 px-3 text-xs font-mono text-neutral-300 outline-none" value={textureUrl} onChange={(e) => setTextureUrl(e.target.value)} />
                    </div>
                  </div>
                  <div className="pt-2 flex gap-2">
                    <button disabled={!selectedNode} onClick={() => isLoaded && selectedNode && sendMessage("NodeManager", "WebUpdateNodeTexture", JSON.stringify({ id: selectedNode.id, imageUrl: textureUrl.trim() }))} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 text-xs font-black uppercase h-9 rounded-lg transition-all shadow-md">Set Node Properties</button>
                    <button disabled={!selectedNode} onClick={() => { if (isLoaded && selectedNode) { sendMessage("NodeManager", "WebDeleteTargetNode", selectedNode.id); setSelectedNode(null); } }} className="bg-neutral-900 hover:bg-red-950/40 border border-neutral-800 px-3 rounded-lg text-neutral-400 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
              </>
            )}

            {/* LINK NODES */}
            {activeMode === "link" && (
              <>
                <div className="p-4 border-b border-neutral-900 bg-neutral-950/30 flex items-center gap-2 shrink-0">
                  <div className="p-1.5 bg-purple-600 rounded text-white"><Link2 size={13} /></div>
                  <div>
                    <h2 className="text-xs font-black tracking-wider uppercase text-neutral-100">Link Nodes</h2>
                    <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-tight">Connect spatial mesh graphs</p>
                  </div>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs scrollbar-thin">
                  <div className="space-y-2 font-mono text-[11px]">
                    <div className="bg-neutral-900/50 border border-neutral-800 p-2.5 rounded-lg border-l-2 border-l-purple-500">
                      <div className="text-[9px] font-black uppercase text-neutral-500 tracking-wide">Neighbor 1 (Anchor Root)</div>
                      <div className="text-neutral-300 font-bold truncate mt-0.5">{linkingSourceId || "Awaiting Node Assignment"}</div>
                    </div>
                    <div className="bg-neutral-900/50 border border-neutral-800 p-2.5 rounded-lg border-l-2 border-l-cyan-500">
                      <div className="text-[9px] font-black uppercase text-neutral-500 tracking-wide">Neighbor 2 (Target Terminal)</div>
                      <div className="text-neutral-300 font-bold truncate mt-0.5">{activeNodeId && activeNodeId !== linkingSourceId ? activeNodeId : "Click scene node..."}</div>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider block mb-1">Active Edge Neighbors</label>
                    <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-2 max-h-[140px] overflow-y-auto space-y-1 font-mono text-[10px] scrollbar-thin">
                      {nodeNeighbors.map((n, i) => (
                        <div key={i} className="flex justify-between items-center bg-neutral-950/50 px-2.5 py-1 rounded border border-neutral-900 text-neutral-400">
                          <span className="truncate pr-2">{n}</span>
                          <button onClick={() => setNodeNeighbors(nodeNeighbors.filter(item => item !== n))} className="text-rose-400 hover:text-rose-300 text-[9px] font-bold uppercase">Delete</button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button onClick={() => activeNodeId && setLinkingSourceId(activeNodeId)} disabled={!activeNodeId} className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[10px] font-black uppercase h-9 rounded-lg disabled:opacity-40">Set Neighbor 1</button>
                    <button 
                      onClick={() => {
                        if (isLoaded && linkingSourceId && activeNodeId && linkingSourceId !== activeNodeId) {
                          sendMessage("NodeManager", "WebLinkNodes", JSON.stringify({ sourceId: linkingSourceId, targetId: activeNodeId }));
                          setNodeNeighbors([...nodeNeighbors, activeNodeId]);
                          setLinkingSourceId(null);
                        }
                      }}
                      disabled={!linkingSourceId || !activeNodeId || linkingSourceId === activeNodeId}
                      className="bg-purple-600 hover:bg-purple-500 disabled:bg-neutral-800 text-[10px] font-black uppercase h-9 rounded-lg shadow-md"
                    >Set Link Connection</button>
                  </div>
                </div>
              </>
            )}

            {/* SET PLACARD */}
            {activeMode === "placard" && (
              <>
                <div className="p-4 border-b border-neutral-900 bg-neutral-950/30 flex items-center gap-2 shrink-0">
                  <div className="p-1.5 bg-amber-600 rounded text-white"><Bookmark size={13} /></div>
                  <div>
                    <h2 className="text-xs font-black tracking-wider uppercase text-neutral-100">Set Placard</h2>
                    <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-tight">Associate real room tokens</p>
                  </div>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs scrollbar-thin">
                  <div>
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider block mb-1">Target Room Name Space</label>
                    <input type="text" placeholder="e.g. MULTIPURPOSE LABORATORY" className="w-full bg-neutral-900/50 border border-neutral-800 rounded h-9 px-3 text-xs font-bold text-white outline-none placeholder-neutral-700 uppercase" value={placardRoomName} onChange={(e) => setPlacardRoomName(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider block mb-1">Placard Side</label>
                      <select className="w-full bg-neutral-900/50 border border-neutral-800 rounded h-9 px-2 text-xs text-neutral-300 outline-none" value={placardSide} onChange={(e) => setPlacardSide(e.target.value)}>
                        <option value="Left">Left Side</option>
                        <option value="Right">Right Side</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider block mb-1">Floor Level</label>
                      <select className="w-full bg-neutral-900/50 border border-neutral-800 rounded h-9 px-2 text-xs text-neutral-300 outline-none" value={selectedFloor} onChange={(e) => setSelectedFloor(e.target.value)}>
                        <option value="1stFloor">1st Floor</option>
                        <option value="2ndFloor">2nd Floor</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 py-1 bg-neutral-950/40 px-2 rounded border border-neutral-900">
                    <input type="checkbox" id="usePos" className="accent-amber-500 h-3.5 w-3.5 cursor-pointer" checked={useNodePosition} onChange={(e) => setUseNodePosition(e.target.checked)} />
                    <label htmlFor="usePos" className="text-[10px] font-black uppercase tracking-wider text-neutral-400 cursor-pointer">Use Selected Node Position</label>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider block mb-1">Registered Room Arrays Manifest</label>
                    <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-2 max-h-[120px] overflow-y-auto space-y-1 font-mono text-[9px] text-neutral-400 font-bold scrollbar-thin">
                      {attachedRooms.map((room, idx) => (
                        <div key={idx} className="bg-neutral-950/80 px-2 py-1 rounded border border-neutral-900 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="h-1.5 w-1.5 bg-amber-500 rounded-full shrink-0" />
                            <span className="truncate">{room.name}</span>
                          </div>
                          <span className="text-[8px] bg-neutral-900 text-neutral-500 px-1.5 py-0.5 rounded uppercase font-black shrink-0">{room.side}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button 
                    disabled={!activeNodeId || !placardRoomName}
                    onClick={() => {
                      if(isLoaded && activeNodeId) {
                        sendMessage("NodeManager", "WebSetPlacardData", JSON.stringify({ id: activeNodeId, roomName: placardRoomName.toUpperCase(), side: placardSide }));
                        setAttachedRooms([...attachedRooms, { name: placardRoomName.toUpperCase(), side: placardSide }]);
                        setPlacardRoomName("");
                      }
                    }}
                    className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-neutral-800 text-xs font-black uppercase h-9 rounded-lg shadow-md"
                  >Set Placard Attributes</button>
                </div>
              </>
            )}

            {/* SCENE HIERARCHY */}
            {activeMode === "hierarchy" && (
              <>
                <div className="p-4 border-b border-neutral-900 bg-neutral-950/30 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-600 rounded text-white"><FolderTree size={13} /></div>
                    <div>
                      <h2 className="text-xs font-black tracking-wider uppercase text-neutral-100">Hierarchy List</h2>
                      <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-tight">Active Engine Hierarchy</p>
                    </div>
                  </div>
                  <button onClick={() => isLoaded && sendMessage("NodeManager", "WebRequestSceneHierarchyList", "")} className="text-neutral-400 hover:text-emerald-400 transition-colors p-1"><RefreshCw size={13} /></button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs scrollbar-thin">
                  <pre className="bg-[#040405] border border-neutral-850 rounded-lg p-3 font-mono text-[10.5px] leading-relaxed max-h-[340px] overflow-y-auto text-neutral-300 whitespace-pre select-all tabs-2 scrollbar-thin">
                    {liveHierarchyText}
                  </pre>
                  <div className="text-[9px] text-neutral-500 font-medium leading-normal bg-neutral-900/30 p-2 rounded border border-neutral-900">
                    💡 Tree sync matches target heap layout constraints instantly.
                  </div>
                </div>
              </>
            )}

            {/* NEW BUILDING */}
            {activeMode === "building" && (
              <>
                <div className="p-4 border-b border-neutral-900 bg-neutral-950/30 flex items-center gap-2 shrink-0">
                  <div className="p-1.5 bg-cyan-600 rounded text-white"><Building2 size={13} /></div>
                  <div>
                    <h2 className="text-xs font-black tracking-wider uppercase text-neutral-100">New Building</h2>
                    <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-tight">Spawn structure containers</p>
                  </div>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs scrollbar-thin">
                  <div>
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider block mb-1">Building Name Identifier</label>
                    <input type="text" placeholder="e.g. Gd_3_Complex" className="w-full bg-neutral-900/50 border border-neutral-800 rounded h-9 px-3 text-xs font-bold text-white outline-none placeholder-neutral-700" value={newBuildingName} onChange={(e) => setNewBuildingName(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider block mb-1">Floor Plan Range Layout</label>
                    <select className="w-full bg-neutral-900/50 border border-neutral-800 rounded h-9 px-3 text-xs text-neutral-300 outline-none" value={floorPlanType} onChange={(e) => setFloorPlanType(e.target.value)}>
                      <option value="4-floors">Standard 4-Floor Quad Setup</option>
                      <option value="8-floors">Extended 8-Floor High Rise Complex</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block mb-1 flex items-center gap-1"><Move size={11}/> Placement Offset Vectors</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["x", "y", "z"] as const).map((axis) => (
                        <div key={axis} className="bg-neutral-900/50 border border-neutral-800 rounded p-1.5 text-center">
                          <span className="text-[9px] font-bold text-neutral-500 block uppercase">{axis}-offset</span>
                          <input type="number" className="w-full bg-transparent outline-none font-mono font-bold text-xs text-neutral-200 text-center mt-0.5" value={buildingOffset[axis]} onChange={(e) => setBuildingOffset({ ...buildingOffset, [axis]: parseFloat(e.target.value) || 0 })} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <button 
                    disabled={!isLoaded || !newBuildingName}
                    onClick={() => isLoaded && sendMessage("BuildingManager", "WebSpawnNewBuildingContainer", JSON.stringify({ name: newBuildingName, floors: floorPlanType, offset: buildingOffset }))}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-neutral-800 text-xs font-black uppercase h-9 rounded-lg transition-all mt-2 shadow-md"
                  >Spawn Building Asset Container</button>
                </div>
              </>
            )}

            {/* BATCH UPLOAD */}
            {activeMode === "batch" && (
              <>
                <div className="p-4 border-b border-neutral-900 bg-neutral-950/30 flex items-center gap-2 shrink-0">
                  <div className="p-1.5 bg-rose-600 rounded text-white"><UploadCloud size={13} /></div>
                  <div>
                    <h2 className="text-xs font-black tracking-wider uppercase text-neutral-100">Batch Upload</h2>
                    <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-tight">Sync production graph registers</p>
                  </div>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs scrollbar-thin">
                  <div>
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider block mb-1">Building Source Context</label>
                    <select className="w-full bg-neutral-900/50 border border-neutral-800 rounded h-9 px-3 text-xs outline-none text-neutral-300 font-bold" value={selectedBuilding} onChange={(e) => setSelectedBuilding(e.target.value)}>
                      <option value="Gd_1">Gd_1_Parent (Active Map Tree)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider block mb-1">Production Firestore Collection</label>
                    <select className="w-full bg-neutral-900/50 border border-neutral-800 rounded h-9 px-3 text-xs font-bold outline-none text-neutral-200" value={selectedCampusTarget} onChange={(e) => setSelectedCampusTarget(e.target.value)}>
                      <option value="MainCampus">Nodes_Main (Main Production Cluster)</option>
                      <option value="DigitalCampus">Nodes_Digital (Sandbox Branch)</option>
                    </select>
                  </div>
                  <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-lg p-2.5 text-[10px] leading-relaxed text-neutral-500 font-medium">
                    <span className="font-bold text-rose-400 block mb-0.5 uppercase tracking-wide flex items-center gap-1.5"><Info size={10}/> Data Constraints</span>
                    Pulls graphs into Firestore atomic write buckets (below the 400 transaction ceiling).
                  </div>
                  <button 
                    disabled={!isLoaded || isUploading}
                    onClick={() => isLoaded && sendMessage("NodeManager", "WebRequestBatchUploadManifest", JSON.stringify({ campusTarget: selectedCampusTarget, buildingName: selectedBuilding }))}
                    className="w-full bg-rose-600 hover:bg-rose-500 disabled:bg-neutral-900 text-xs font-black uppercase h-9 rounded-lg flex items-center justify-center shadow-lg"
                  >{isUploading ? "Processing Transactions..." : "Execute Batch Upload"}</button>
                </div>
              </>
            )}

            {/* FOOTER */}
            <div className="p-3 bg-neutral-950/60 border-t border-neutral-900 shrink-0">
              <button 
                disabled={!isLoaded} 
                onClick={() => alert(`Staging all mutations active on: [${activeMode.toUpperCase()}] frame buffer.`)} 
                className="w-full bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 text-[10px] font-black uppercase h-9 rounded-lg flex items-center justify-center gap-1.5 text-neutral-300"
              >
                <CheckCircle2 size={12} className="text-emerald-400" /> Compile & Commit Workspace
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}