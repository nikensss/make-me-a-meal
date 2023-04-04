import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';
import { Configuration, OpenAIApi } from 'openai';

export const chatGptRouter = createTRPCRouter({
  ask: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(async ({ input }) => {
      try {
        const configuration = new Configuration({
          apiKey: process.env.OPENAI_API_KEY,
        });
        const openai = new OpenAIApi(configuration);

        const completion = await openai.createCompletion({
          model: 'text-davinci-003',
          max_tokens: 1792,
          prompt:
            'En mi nevera tengo arroz, tomate, cebolla, pollo vegano y pepino. Quiero hacer una receta con estos ingredientes. ¿Qué puedo hacer? Proporciona los pasos en una lista.',
        });
        const choices = completion.data.choices.map(({ text }) => text).join();

        return {
          steps: choices.split('\n').filter((e) => !!e),
          input,
        };
      } catch (e) {
        console.error(e);
        return { steps: [], input };
      }
    }),
});
