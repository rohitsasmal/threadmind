import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

interface Message {
  id: string;
  text: string;
  editable: boolean;
}

export default function EditMessage({ message }: { message: Message }) {
  const [text, setText] = useState(message.text);
  const router = useRouter();

  const handleEdit = async () => {
    await supabase.from("messages").update({ text }).eq("id", message.id);
    router.reload();
  };

  return (
    <div>
      {message.editable ? (
        <>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{
              backgroundColor: "#222",
              color: "white",
              border: "1px solid white",
              padding: "5px",
              margin: "5px"
            }}
          />
          <button
            onClick={handleEdit}
            style={{
              backgroundColor: "transparent",
              color: "white",
              border: "1px solid white",
              padding: "10px",
              margin: "5px"
            }}
          >
            Edit
          </button>
        </>
      ) : (
        <p style={{ color: "white", padding: "5px", margin: "5px", borderBottom: "1px solid white" }}>
          {message.text}
        </p>
      )}
    </div>
  );
}
