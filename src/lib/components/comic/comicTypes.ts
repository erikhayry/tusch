   import {z} from "zod";

   export const ComicPropsSchema = z.object({
       title: z.string(),
   });

   export type ComicProps = z.infer<typeof ComicPropsSchema>;
