import { TRPCError } from '@trpc/server';
import { Configuration, OpenAIApi } from 'openai';
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

export const chatGptRouter = createTRPCRouter({
  ask: publicProcedure
    .input(z.object({ text: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.userId) throw new TRPCError({ code: 'UNAUTHORIZED' });

        const configuration = new Configuration({
          apiKey: process.env.OPENAI_API_KEY,
        });
        const openai = new OpenAIApi(configuration);

        const completion = await openai.createCompletion({
          model: 'text-davinci-003',
          max_tokens: 1792,
          prompt: `En la nevera tengo: ${input.text}\n\n¿Qué puedo hacer con esto? Dame una lista con los pasos.\n\n`,
        });
        const choices = completion.data.choices.map(({ text }) => text).join();

        return {
          steps: choices.split('\n').filter((e) => !!e),
        };
      } catch (e) {
        console.error(e);
        return { steps: [] };
      }
    }),
});
