
function validateTask(taskData) {

    if (!taskData.title.trim()) {
        alert("Title cannot be empty")
        return false;
    } else if (taskData.title.trim().length > 100) {
        alert("Title cannot exceed 100 characters!")
        return false;
    }
    if (taskData.description && taskData.description.trim().length > 500) {
        alert("Description cannot exceed 500 characters!")
        return false;
    }
    if (!taskData.description) {
        taskData.description = null
    }
    if (taskData.assignees && taskData.assignees.trim().length > 30) {
        alert("Assignees should not exceed 30 characters.")
        return false;

    }if (!taskData.assignees) {
        taskData.assignees = null
    }

    return true;
}
export {validateTask}