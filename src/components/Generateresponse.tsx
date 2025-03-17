import { useState } from "react";
import { LoremIpsum } from "lorem-ipsum";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

interface GenerateResponseProps {
  parentId: string;
  path: { id: string; type: string }[];
  messageId: string;
}

export default function GenerateResponse({ parentId, path, messageId }: GenerateResponseProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const lorem = new LoremIpsum({
    sentencesPerParagraph: { max: 3, min: 1 },
    wordsPerSentence: { max: 10, min: 4 }
  });

  const generateResponse = async () => {
    setLoading(true);

    // Generate a fake "bot" response
    const botResponse = lorem.generateSentences(2);

    // Save the response with type "BOT" and set editable=false
    let { error } = await supabase
      .from("messages")
      .insert([{ text: botResponse, type: "BOT", parent: parentId, editable: false }]);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    // Collect all ancestors (including messageId) that are NOT ROOT
    const nodesToUpdate = path
      .filter(node => node.type !== "ROOT")
      .map(node => node.id);

    nodesToUpdate.push(messageId); // Include the current message itself

    if (nodesToUpdate.length > 0) {
      // Update all ancestors to be uneditable
      await supabase
        .from("messages")
        .update({ editable: false })
        .in("id", nodesToUpdate);
    }

    setLoading(false);
    router.reload();
  };

  return (
    <button onClick={generateResponse} disabled={loading}>
      {loading ? "Generating..." : "Generate"}
    </button>
  );
}
