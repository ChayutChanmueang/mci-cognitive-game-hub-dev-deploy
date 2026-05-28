export const UserEvent = Object.freeze({
    LOGIN: "user.login",
    GAME_OPENED: "game.opened",
    GAME_CLOSED: "game.closed",
    LOGOUT: "user.logout",
});

export function isUserEvent(actionId) {
    return Object.values(UserEvent).includes(actionId);
}

export default UserEvent;
