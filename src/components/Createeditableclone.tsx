import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

interface CloneProps {
  path: { id: string; text: string; type: string; parent: string | null }[];
  messageId: string;
  messageParent: string | null;
  messageType: string;
  messageText: string;
}

export default function CreateEditableClone({ path, messageId, messageParent, messageType, messageText }: CloneProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const createClone = async () => {
    setLoading(true);

    let newIdMap: { [oldId: string]: string } = {}; // Maps original IDs to cloned IDs

    // Filter out the root node (ROOT nodes should not be cloned)
    const nodesToClone = path.filter(node => node.type !== "ROOT");

    // Clone all parents first
    for (let i = 0; i < nodesToClone.length; i++) {
      const node = nodesToClone[i];

      // Determine new type (BOT → BOTEDIT, retain USER & BOTEDIT)
      let newType = node.type === "BOT" ? "BOTEDIT" : node.type;

      // Determine parent: If it's the first cloned node, its parent should be the original node's parent
      let newParent = i === 0 ? messageParent : newIdMap[nodesToClone[i - 1].id];

      // Insert the cloned node
      let { data, error } = await supabase
        .from("messages")
        .insert([{ text: node.text, type: newType, parent: newParent, editable: true }])
        .select("id")
        .single();

      if (error) {
        console.error("Error cloning node:", error);
        setLoading(false);
        return;
      }

      newIdMap[node.id] = data.id; // Map old ID to new cloned ID
    }

    // Finally, clone the current message itself as a child of the last cloned node
    let newType = messageType === "BOT" ? "BOTEDIT" : messageType;
    let newParent = nodesToClone.length > 0 ? newIdMap[nodesToClone[nodesToClone.length - 1].id] : messageParent;

    let { data, error } = await supabase
      .from("messages")
      .insert([{ text: messageText, type: newType, parent: newParent, editable: true }])
      .select("id")
      .single();

    if (error) {
      console.error("Error cloning messageId:", error);
      setLoading(false);
      return;
    }

    // Redirect to the new cloned message
    router.push(`/${data.id}`);
    setLoading(false);
    router.reload();
  };

  return (
    <button 
      onClick={createClone} 
      disabled={loading} 
      style={{ 
        marginTop: "10px",
        opacity: loading ? 0.5 : 1, 
        cursor: loading ? "not-allowed" : "pointer"
      }}
    >
      {loading ? "Cloning..." : "Create Editable Path Clone"}
    </button>
  );
}
