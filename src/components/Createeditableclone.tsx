import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

interface CloneProps {
  path: { id: string; text: string; type: string; parent: string | null }[];
  messageId: string;
}

export default function CreateEditableClone({ path, messageId }: CloneProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const createClone = async () => {
    setLoading(true);

    let newIdMap: { [oldId: string]: string } = {}; // Map old IDs to new cloned IDs

    // Create clones for all nodes in the path
    for (let i = 0; i < path.length; i++) {
      const node = path[i];

      // Determine new type
      let newType = node.type === "BOT" ? "BOTEDIT" : node.type;

      // Determine parent: If it's the first node in the path, it will be NULL (new ROOT)
      let newParent = i === 0 ? null : newIdMap[path[i - 1].id];

      // Insert the new cloned node
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

      newIdMap[node.id] = data.id; // Map old ID to new ID
    }

    // Finally, clone the <messageId> itself as a child of the last cloned node
    const originalMessage = path.find((node) => node.id === messageId);
    if (originalMessage) {
      let newType = originalMessage.type === "BOT" ? "BOTEDIT" : originalMessage.type;
      let newParent = newIdMap[path[path.length - 1].id];

      let { data, error } = await supabase
        .from("messages")
        .insert([{ text: originalMessage.text, type: newType, parent: newParent, editable: true }])
        .select("id")
        .single();

      if (error) {
        console.error("Error cloning messageId:", error);
        setLoading(false);
        return;
      }

      router.push(`/${data.id}`);
    }

    setLoading(false);
    router.reload();
  };

  return (
    <button onClick={createClone} disabled={loading} style={{ marginTop: "10px" }}>
      {loading ? "Cloning..." : "Create Editable Path Clone"}
    </button>
  );
}
