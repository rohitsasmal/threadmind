import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import AddMessage from "../components/Addmessage";
import EditMessage from "../components/Editmessage";

interface Message {
  id: string;
  text: string;
  parent: string | null;
  editable: boolean;
}

export default function MessagePage() {
  const router = useRouter();
  const { messageId } = router.query;
  
  const [message, setMessage] = useState<Message | null>(null);
  const [children, setChildren] = useState<Message[]>([]);
  const [path, setPath] = useState<Message[]>([]);

  useEffect(() => {
    if (!messageId) return;

    const fetchMessage = async () => {
      let { data, error } = await supabase
        .from("messages")
        .select("id, text, parent, editable")
        .eq("id", messageId)
        .single();
        
      if (error) console.error(error);
      else {
        setMessage(data);
        fetchChildren(data.id);
        fetchPath(data.parent);
      }
    };

    const fetchChildren = async (parentId: string) => {
      let { data, error } = await supabase
        .from("messages")
        .select("id, text, parent, editable")
        .eq("parent", parentId);
      
      if (error) console.error(error);
      else setChildren(data);
    };

    const fetchPath = async (parentId: string | null) => {
      let pathArray: Message[] = [];
      let currentId = parentId;
      
      while (currentId) {
        let { data, error } = await supabase
          .from("messages")
          .select("id, text, parent, editable")
          .eq("id", currentId)
          .single();

        if (error) break;
        pathArray.unshift(data);
        currentId = data.parent;
      }
      setPath(pathArray);
    };

    fetchMessage();
  }, [messageId]);

  const goToParent = () => {
    if (message?.parent) {
      router.push(`/${message.parent}`).then(() => {
        router.reload(); // Reload the page after navigation
      });
    }
  };

  const goToChild = (childId: string) => {
    router.push(`/${childId}`).then(() => {
      router.reload(); // Reload the page after navigation
    });
  };

  if (!message) return <p>Loading...</p>;

  return (
    <div style={{ display: "flex", gap: "20px", padding: "20px", backgroundColor: "#000000", minHeight: "100vh" }}>
      <div style={{ flex: 2 }}>
        <h2>{message.text} (USER)</h2>

        {/* Go to Parent Button with Reload */}
        {message.parent ? (
          <button onClick={goToParent}>Go to Parent</button>
        ) : (
          <button disabled style={{ opacity: 0.5 }}>Root Node</button>
        )}

        {message.editable && <EditMessage message={message} />}
      </div>

      <div style={{ flex: 1, overflowY: "auto", maxHeight: "500px", border: "1px solid white", padding: "10px" }}>
        <h3>Children</h3>
        <ul>
          {children.map((child) => (
            <li key={child.id}>
              <button onClick={() => goToChild(child.id)}>{child.text} (USER)</button>
            </li>
          ))}
        </ul>
        <AddMessage parentId={message.id} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", maxHeight: "500px", border: "1px solid white", padding: "10px" }}>
        <h3>Path</h3>
        <ul>
          {path.map((node) => (
            <li key={node.id}>
              <button onClick={() => goToChild(node.id)}>{node.text} (USER)</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
