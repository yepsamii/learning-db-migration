import { client } from "../metrics.js";

export const getMetrics = async (req, res) => {
  res.setHeader("Content-Type", client.register.contentType);
  res.send(await client.register.metrics());
};
