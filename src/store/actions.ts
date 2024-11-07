export const addTask = (groupId: string, content: string) => ({
    type: 'ADD_TASK',
    payload: { groupId, content },
});

export const toggleGroup = (groupId: string) => ({
    type: 'TOGGLE_GROUP',
    payload: { groupId },
});

export const moveTask = (sourceGroupId: string, destinationGroupId: string, taskId: string) => ({
    type: 'MOVE_TASK',
    payload: { sourceGroupId, destinationGroupId, taskId },
});
