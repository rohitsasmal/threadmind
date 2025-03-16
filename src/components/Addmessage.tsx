import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

export default function AddMessage({ parentId }: { parentId: string }) {
  const [text, setText] = useState("");
  const router = useRouter();

  const handleAdd = async () => {
    if (!text.trim()) return;

    let { error } = await supabase
      .from("messages")
      .insert([{ text, type: "USER", parent: parentId, editable: true }]);

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
