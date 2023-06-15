// all Java calls need to be wrapped in a Java.perform().
// this helper just wraps that into a Promise that the
// rpc export will sniff and resolve before returning
// the result when its ready.
export const wrapJavaPerform = (fn: any): Promise<any> => {
    return new Promise((resolve, reject) => {
        // check and wait for the currentApplication is ready
        function waitForApplicationReady(callback) {
            if (global.appIsReady != null) {
                callback();
                return;
            }

            if (Java.use("android.app.ActivityThread").currentApplication() != null) {
                callback();
                global.appIsReady = true;
                return;
            }
            //log only once
            if (global.log_waitAppReady == null) {
                global.log_waitAppReady = true;
                console.log("wait for currentApplication to be ready..");
            }
            setTimeout(() => {
                waitForApplicationReady(callback);
            }, 10);
        }

        waitForApplicationReady(() => {
            Java.perform(() => {
                try {
                    resolve(fn());
                } catch (e) {
                    reject(e);
                }
            });
        });
    });
};

export const getApplicationContext = (): any => {
    const ActivityThread = Java.use("android.app.ActivityThread");
    const currentApplication = ActivityThread.currentApplication();

    return currentApplication.getApplicationContext();
};

// A helper method to access the R class for the app.
// Typical usage within an app would be something like:
//  R.id.content_frame.
//
// Using this method, the above example would be:
//  R("content_frame", "id")
export const R = (name: string, type: string): any => {
    const context = getApplicationContext();
    // https://github.com/bitpay/android-sdk/issues/14#issue-202495610
    return context.getResources().getIdentifier(name, type, context.getPackageName());
};
