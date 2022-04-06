import axios from "axios";

export const jsonlToJson = async (jsonlUrl?: string) => {
  if (jsonlUrl) {
    const { data } = await axios.get(jsonlUrl);
    return data
      .split(/\r?\n/)
      .filter((s) => s.length)
      .map(JSON.parse);
  }
};
