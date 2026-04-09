import { testDb } from "@tokistack/test-utils";

jest.mock("@tokistack/db", () => ({
  ...jest.requireActual("@tokistack/db"),
  createDb: () => testDb,
}));

jest.mock("../src/common/services/params.service", () => ({
  resolveParameter: () => Promise.resolve(process.env.DATABASE_URL),
}));
