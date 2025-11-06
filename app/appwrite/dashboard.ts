import { parseTripData } from "~/lib/utils";
import type { DashboardStats } from "..";
import { appwriteConfig, database } from "./client";
import { user } from "~/constants";
import { Query } from "appwrite";
import { getUser } from "./auth";

interface Document {
  [key: string]: any;
}

type FilterByDate = (
  items: Document[],
  key: string,
  start: string,
  end?: string
) => number;

export const getUserAndTripsStats = async (): Promise<DashboardStats> => {
  const d = new Date();
  const startCurrent = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
  const startPrev = new Date(
    d.getFullYear(),
    d.getMonth() - 1,
    1
  ).toISOString();
  const endPrev = new Date(d.getFullYear(), d.getMonth(), 0).toISOString();

  const [users, trips] = await Promise.all([
    database.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.usersTableId,
    }),
    database.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.tripsTableId,
    }),
  ]);

  // Counts how many documents in an array fall within a given date range
  const filterByDate: FilterByDate = (items, key, start, end) =>
    items.filter((item) => item[key] >= start && (!end || item[key] <= end))
      .length;

  const filterUsersByRole = (role: string) => {
    return users.rows.filter((u: Document) => u.status === role);
  };

  return {
    totalUsers: users.total,
    usersJoined: {
      currentMonth: filterByDate(
        users.rows,
        "joinedAt",
        startCurrent,
        undefined
      ),
      lastMonth: filterByDate(users.rows, "joinedAt", startPrev, endPrev),
    },
    userRole: {
      total: filterUsersByRole("user").length,
      currentMonth: filterByDate(
        filterUsersByRole("user"),
        "joinedAt",
        startCurrent,
        undefined
      ),
      lastMonth: filterByDate(
        filterUsersByRole("user"),
        "joinedAt",
        startPrev,
        endPrev
      ),
    },
    totalTrips: trips.total,
    tripsCreated: {
      currentMonth: filterByDate(
        trips.rows,
        "$createdAt",
        startCurrent,
        undefined
      ),
      lastMonth: filterByDate(trips.rows, "$createdAt", startPrev, endPrev),
    },
  };
};

export const getUserGrowthPerDay = async () => {
  const users = await database.listRows({
    databaseId: appwriteConfig.databaseId,
    tableId: appwriteConfig.usersTableId,
  });

  const userGrowth = users.rows.reduce(
    (acc: { [key: string]: number }, user: Document) => {
      const date = new Date(user.joinedAt);
      const day = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    },
    {}
  );

  return Object.entries(userGrowth).map(([day, count]) => ({
    count: Number(count),
    day,
  }));
};

export const getTripsCreatedPerDay = async () => {
  const trips = await database.listRows({
    databaseId: appwriteConfig.databaseId,
    tableId: appwriteConfig.tripsTableId,
  });

  const tripsGrowth = trips.rows.reduce(
    (acc: { [key: string]: number }, trip: Document) => {
      const date = new Date(trip.$createdAt);
      const day = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    },
    {}
  );

  return Object.entries(tripsGrowth).map(([day, count]) => ({
    count: Number(count),
    day,
  }));
};

export const getTripsByTravelStyle = async () => {
  const trips = await database.listRows({
    databaseId: appwriteConfig.databaseId,
    tableId: appwriteConfig.tripsTableId,
  });

  const travelStyleCounts = trips.rows.reduce(
    (acc: { [key: string]: number }, trip: Document) => {
      const tripDetail = parseTripData(trip.tripDetail);

      if (tripDetail && tripDetail.travelStyle) {
        const travelStyle = tripDetail.travelStyle;
        acc[travelStyle] = (acc[travelStyle] || 0) + 1;
      }

      return acc;
    },
    {}
  );

  return Object.entries(travelStyleCounts).map(([travelStyle, count]) => ({
    count: Number(count),
    travelStyle,
  }));
};

export const updateUserItineraryCount = async (
  userId: string,
  accountId: string
) => {
  try {
    const { total } = await database.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.tripsTableId,
      queries: [Query.equal("userId", accountId)],
    });

    const updatedUser = await database.updateRow({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.usersTableId,
      rowId: userId,
      data: {
        itineraryCount: total + 1,
      },
    });

    return updatedUser;
  } catch (error) {
    console.log("Failed to update user itinerary count: ", error);
  }
};
