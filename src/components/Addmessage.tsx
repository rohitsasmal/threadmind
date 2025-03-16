import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

export default function AddMessage({ parentId }: { parentId: string }) {
  const [text, setText] = useState("");
  const [parentType, setParentType] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchParentType = async () => {
      let { data, error } = await supabase
        .from("messages")
        .select("type")
        .eq("id", parentId)
        .single();

      if (error) console.error(error);
      else setParentType(data.type);
    };

    fetchParentType();
  }, [parentId]);

  const determineChildType = () => {
    if (parentType === "ROOT") return "USER";
    if (parentType === "USER") return "BOTEDIT";
    if (parentType === "BOTEDIT") return "USER";
    return "USER"; // Default case (failsafe)
  };

  const handleAdd = async () => {
    if (!text.trim()) return;

    let { error } = await supabase
      .from("messages")
      .insert([{ text, type: determineChildType(), parent: parentId, editable: true }]);

    if (error) console.error(error);
    else router.reload();
  };

  return (
    <div>
      <input placeholder="Text" value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={handleAdd}>Add Message</button>
    </div>
  );
}
