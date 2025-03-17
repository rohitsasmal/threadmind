import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import AddMessage from "../components/Addmessage";
import EditMessage from "../components/Editmessage";
import GenerateResponse from "../components/Generateresponse";

interface Message {
  id: string;
  text: string;
  type: string;
  parent: string | null;
  editable: boolean;
}

export default function MessagePage() {
  const router = useRouter();
  const { messageId } = router.query;
  
  const [message, setMessage] = useState<Message | null>(null);
  const [children, setChildren] = useState<Message[]>([]);
  const [path, setPath] = useState<{ id: string; type: string; editable: boolean }[]>([]);

  useEffect(() => {
    if (!messageId) return;

    const fetchMessage = async () => {
      let { data, error } = await supabase
        .from("messages")
        .select("id, text, type, parent, editable")
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
        .select("id, text, type, parent, editable")
        .eq("parent", parentId);
      
      if (error) console.error(error);
      else setChildren(data);
    };

    const fetchPath = async (parentId: string | null) => {
      let pathArray: { id: string; type: string; editable: boolean }[] = [];
      let currentId = parentId;

      while (currentId) {
        let { data, error } = await supabase
          .from("messages")
          .select("id, text, type, parent, editable")
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
        router.reload();
      });
    }
  };

  const goToChild = (childId: string) => {
    router.push(`/${childId}`).then(() => {
      router.reload();
    });
  };

  const goHome = () => {
    router.push(`/`).then(() => {
      router.reload();
    });
  };

  if (!message) return <p>Loading...</p>;

  return (
    <div style={{ display: "flex", gap: "20px", padding: "20px", backgroundColor: "#000000", minHeight: "100vh" }}>
      <div style={{ flex: 2 }}>
        <h2>{message.text} ({message.type})</h2>

        {/* Editable status display */}
        <p style={{
          color: message.editable ? "lightgreen" : "red",
          fontWeight: "bold",
          marginTop: "-10px"
        }}>
          Editable: {message.editable ? "Yes" : "No"}
        </p>

        <button onClick={goHome} style={{ marginBottom: "10px" }}>Go Home</button>

        {message.parent ? (
          <button onClick={goToParent}>Go to Parent</button>
        ) : (
          <button disabled style={{ opacity: 0.5 }}>Root Node</button>
        )}

        {/* Passes editability status to EditMessage */}
        <EditMessage message={message} />

        {/* Show "Generate" button ONLY if the current message type is USER */}
        {message.type === "USER" && (
          <GenerateResponse parentId={message.id} messageId={message.id} path={path} />
        )}
      </div>

      <div style={{ flex: 1, overflowY: "auto", maxHeight: "500px", border: "1px solid white", padding: "10px" }}>
        <h3>Children</h3>
        <ul>
          {children.map((child) => (
            <li key={child.id}>
              <button onClick={() => goToChild(child.id)}>{child.text} ({child.type})</button>
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
              <button onClick={() => goToChild(node.id)}>{node.text} ({node.type})</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
