import * as admin from "firebase-admin";
import serviceAccount from "./google_credential.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
  storageBucket: `${serviceAccount.project_id}.appspot.com`,
});
admin.firestore().settings({ ignoreUndefinedProperties: true });

import app from "./app";

const server = app.listen(app.get("port"), () => {
  console.log(
    "e-register backend e is running at port %d in %s mode",
    app.get("port"),
    app.get("env")
  );
  console.log("  Press CTRL-C to stop\n");
});

export default server;
