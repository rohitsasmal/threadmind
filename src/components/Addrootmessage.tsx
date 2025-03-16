import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

export default function AddRootMessage({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState("");
  const router = useRouter();

  const handleAddRoot = async () => {
    if (!text.trim()) return;

    let { error } = await supabase
      .from("messages")
      .insert([{ text, type: "USER", parent: null, editable: true }]);

    if (error) console.error(error);
    else {
      onClose(); // Close dialog
      router.reload(); // Refresh to show new root message
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "#111111",
      color: "white",
      padding: "20px",
      border: "1px solid white",
      zIndex: 1000
    }}>
      <h2>Add Root Message</h2>
      <input placeholder="Text" value={text} onChange={(e) => setText(e.target.value)} />
      <div>
        <button onClick={handleAddRoot}>Add</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
