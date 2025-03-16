import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";
import React from "react";

interface Message {
  id: string;
  text: string;
  type: string;
  parent: string | null;
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
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={handleEdit}>Edit</button>
    </div>
  );
}
