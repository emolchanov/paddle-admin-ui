import { getDatabase } from "./get-database";
import { initSettingsTable } from "./settings/init";
import { initUsersTable } from "./users/init";

export function clearDatabase() {
  const dbInstance = getDatabase();
  dbInstance.exec(
    `DROP TABLE IF EXISTS keys; DROP TABLE IF EXISTS settings; DROP TABLE IF EXISTS users;`
  );
  initSettingsTable(dbInstance);
  initUsersTable(dbInstance);
}
