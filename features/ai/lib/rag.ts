import { embed } from "ai";
import { google } from "@ai-sdk/google";
import { pineconeIndex } from "@/lib/pinecone";
import { openai } from '@ai-sdk/openai';

export const generateEmbeddings = async (text: string) => {
  const { embedding } = await embed({
    model: openai.embeddingModel("text-embedding-3-small"),
    value: text,
    providerOptions:{
      openai:{
        dimensions: 512
      }
    }
  });

  return embedding;
};

export const indexCodebase = async (
  repoId: string,
  files: { path: string; content: string }[],
) => {
  const vectors = [];
  for (const file of files) {
    const content = `File: ${file.path}\n\n${file.content}`;
    const truncatedContent = content.slice(0, 8000);
    try {
      const embedding = await generateEmbeddings(truncatedContent);
      vectors.push({
        id: `${repoId}-${file.path.replace(/\//g, "_")}`,
        values: embedding,
        metadata: {
          repoId,
          path: file.path,
          content: truncatedContent,
        },
      });
    } catch (error) {
      console.error(`Error generating embedding for file ${file.path}:`, error);
      throw new Error(`Error generating embedding for file ${file.path}: ${error}`);
    }
  }
  if (vectors.length > 0) {
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      try {
        await pineconeIndex.upsert(batch);
      } catch (error) {
        console.error("Error upserting batch to Pinecone:", error);
        throw new Error("Error upserting batch to Pinecone: " + error);
      }
    }
  }

  console.log(`Indexed ${vectors.length} vectors for repo ${repoId}`);
};

export const retrieveContent = async ({
  query,
  repoId,
  topK=5,
}: {
  query: string;
  repoId: string;
  topK?: number;
}) => {
    const embedding = await generateEmbeddings(query);

    try {
        const results = await pineconeIndex.query({
            vector: embedding,
            topK,
            filter: {repoId},
            includeMetadata: true,
        })

        return results.matches?.map((match)=>match.metadata?.content as string).filter(Boolean) ;
    } catch (error) {
        throw new Error("Error retrieving content from Pinecone: " + error);
    }
};
