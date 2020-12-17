export function timeDifference(main) {
    return Math.floor((new Date().getTime() - main.timestamp) / 1000);
}

export function sleep(time) {
    return new Promise((resolve, reject) => setTimeout(resolve, time))
}