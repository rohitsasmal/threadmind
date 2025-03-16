import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";
import AddRootMessage from "../components/Addrootmessage"; // Import new component

interface Message {
  id: string;
  text: string;
  type: string;
}

export default function Home() {
  const [roots, setRoots] = useState<Message[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchRoots = async () => {
      let { data, error } = await supabase
        .from("messages")
        .select("id, text, type")
        .is("parent", null);

      if (error) console.error(error);
      else setRoots(data);
    };

    fetchRoots();
  }, []);

  return (
    <div style={{ padding: "20px", backgroundColor: "#000000", minHeight: "100vh" }}>
      <h1>Root Messages</h1>
      <button onClick={() => setIsDialogOpen(true)}>Add Root Message</button>
      {isDialogOpen && <AddRootMessage onClose={() => setIsDialogOpen(false)} />}
      <ul>
        {roots.map((msg) => (
          <li key={msg.id}>
            <Link href={`/${msg.id}`}>
              <button>{msg.text} ({msg.type})</button>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
