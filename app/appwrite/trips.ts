import { Query } from "appwrite";
import { appwriteConfig, database } from "./client";

export const getAllTrips = async (limit: number, offset: number) => {
  const allTrips = await database.listRows({
    databaseId: appwriteConfig.databaseId,
    tableId: appwriteConfig.tripsTableId,
    queries: [
      Query.limit(limit),
      Query.offset(offset),
      Query.orderDesc("$createdAt"),
    ],
  });

  if (allTrips.total === 0) {
    console.log("No trips found");
    return { allTrips: [], total: 0 };
  }

  return {
    allTrips: allTrips.rows,
    total: allTrips.total,
  };
};

export const getTripById = async (tripId: string) => {
  const trip = await database.getRow({
    databaseId: appwriteConfig.databaseId,
    tableId: appwriteConfig.tripsTableId,
    rowId: tripId,
  });

  if (!trip.$id) {
    console.log("Trip not found");
    return null;
  }

  return trip;
};
