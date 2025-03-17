import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import AddMessage from "../components/Addmessage";
import EditMessage from "../components/Editmessage";
import GenerateResponse from "../components/Generateresponse";
import CreateEditableClone from "../components/Createeditableclone";

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
  const [path, setPath] = useState<Message[]>([]);

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
      else setChildren(data || []);
    };

    const fetchPath = async (parentId: string | null) => {
      let pathArray: Message[] = [];
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

      setPath(pathArray || []);
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

  const goToPathNode = (nodeId: string) => {
    router.push(`/${nodeId}`).then(() => {
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
      
      {/* Main message area (Left) */}
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

        {/* Go to Parent button */}
        {message.parent ? (
          <button onClick={goToParent} style={{ marginBottom: "10px" }}>Go to Parent</button>
        ) : (
          <button disabled style={{ opacity: 0.5, marginBottom: "10px" }}>Root Node</button>
        )}

        {/* Create Editable Path Clone button (Disabled for ROOT nodes) */}
        {message.type !== "ROOT" && <CreateEditableClone path={path} messageId={message.id} messageParent={message.parent} messageType={message.type} messageText={message.text} />}

        {/* Passes editability status to EditMessage */}
        <EditMessage message={message} />

        {/* Show "Generate" button ONLY if the current message type is USER */}
        {message.type === "USER" && (
          <GenerateResponse parentId={message.id} messageId={message.id} path={path} />
        )}
      </div>

      {/* Children section (Middle) */}
      <div style={{ flex: 1, overflowY: "auto", maxHeight: "500px", border: "1px solid white", padding: "10px" }}>
        <h3>Children</h3>
        {children.length > 0 ? (
          <ul>
            {children.map((child) => (
              <li key={child.id} style={{
                border: child.editable ? "2px solid lightgreen" : "2px solid red",
                padding: "5px",
                marginBottom: "5px"
              }}>
                <button 
                  onClick={() => goToChild(child.id)}
                  style={{
                    background: "transparent",
                    color: "white",
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  {child.text} ({child.type})
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: "white", opacity: 0.5 }}>No children yet.</p>
        )}
        <AddMessage parentId={message.id} />
      </div>

      {/* Path section (Right) */}
      <div style={{ flex: 1, overflowY: "auto", maxHeight: "500px", border: "1px solid white", padding: "10px" }}>
        <h3>Path</h3>
        {path.length > 0 ? (
          <ul>
            {path.map((node) => (
              <li key={node.id} style={{
                border: node.editable ? "2px solid lightgreen" : "2px solid red",
                padding: "5px",
                marginBottom: "5px"
              }}>
                <button 
                  onClick={() => goToPathNode(node.id)}
                  style={{
                    background: "transparent",
                    color: "white",
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  {node.text} ({node.type})
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: "white", opacity: 0.5 }}>No parent path.</p>
        )}
      </div>
    </div>
  );
}
