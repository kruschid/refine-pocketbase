import { LiveEvent, LiveProvider } from "@refinedev/core";
import PocketBase, { UnsubscribeFunc } from "pocketbase";

export const liveProvider = (pb: PocketBase): LiveProvider => ({
  subscribe: ({ channel, params, callback }) => {
    return pb
      .collection(channel.replace("resources/", ""))
      .subscribe(params?.id?.toString() ?? "*", (e) => {
        const liveEvent: LiveEvent = {
          channel,
          date: new Date(),
          payload: e.record,
          type: e.action,
        };

        callback(liveEvent);
      });
  },
  unsubscribe: (unsubscribeFn: Promise<UnsubscribeFunc>) => {
    unsubscribeFn.then((unsub) => unsub());
  },
});
