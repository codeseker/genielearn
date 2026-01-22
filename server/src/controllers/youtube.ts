import { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { errorResponse, successResponse } from "../utils/api";
import axios from "axios";

export const fetchVideos = asyncHandler(async (req: Request, res: Response) => {
  const { search } = req.query;
  if (!search) {
    return errorResponse(res, {
      statusCode: 400,
      message: "Search query is required",
    });
  }

  const videos = await axios.get(
    `https://www.googleapis.com/youtube/v3/search?key=${process.env.YOUTUBE_API_KEY}&type=video&q=${search}`,
  );
  const allIds = videos.data.items.map((item: any) => item.id.videoId);

  return successResponse(res, {
    statusCode: 200,
    data: allIds,
  });
});
