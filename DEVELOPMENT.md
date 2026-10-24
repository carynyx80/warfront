# Development

Run the README commands. The web client and WebSocket server share port 3000. Client edits take effect on browser refresh; hot module replacement is not implemented. Restart the process for server changes. Run `pnpm build` after editing shared simulation code to copy it to the browser bundle.

The /dev route reports connected humans, actual match ID, measured client frame rate and ping round trip, health endpoint simulation ticks, build timestamp/test report, captured client errors and server events. It makes no completion-percentage claim. Build reports are generated after verification. The entire browser canvas still renders behind the telemetry column; viewport separation is a visual overlay.

The server denies /dev in production without a configured Bearer header. Configure the reverse proxy to require operator login and inject that header. Do not expose the development client publicly; static hosts require their own access controls. `ALLOWED_ORIGIN` restricts browser WebSocket origins when configured, but is not user authentication.
