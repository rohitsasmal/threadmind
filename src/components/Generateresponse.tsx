import { useState } from "react";
import { LoremIpsum } from "lorem-ipsum";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

interface GenerateResponseProps {
  parentId: string;
  path: string[];
}

export default function GenerateResponse({ parentId, path }: GenerateResponseProps) {
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

    // Save the response with type "BOT"
    let { error } = await supabase
      .from("messages")
      .insert([{ text: botResponse, type: "BOT", parent: parentId, editable: false }]);

    setLoading(false);

    if (error) console.error(error);
    else router.reload();
  };

  return (
    <button onClick={generateResponse} disabled={loading}>
      {loading ? "Generating..." : "Generate"}
    </button>
  );
}
