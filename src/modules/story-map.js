/**
 * Apply changes to a list element to make it a story map.
 * Remove empty text nodes. (This is necessary because empty text nodes make the layout inconsistent.)
 * Wrap text nodes in a span.story element.
 * Wrap the topmost text node in a span.story.goal element.
 * The second level of text nodes should be wrapped in a span.story.step element.
 * The third level of text nodes should be wrapped in a span.story.task element.
 * @param {HTMLElement} root - The root list element of the story map.
 */
function StoryMap(root) {
    this.original = root.cloneNode(true);
    this.root = root;
    this.root.classList.add('storymap');
    this.setStoryProps();
    this.removeEmptyTextNodes();
    this.wrapGoal();
    this.wrapSteps();
    this.wrapTasks();
    this.makeDraggable();
    this.observeEditable();
    this.observeAddRemoveButtons();
}
StoryMap.prototype = {
    /**
     * Set the width and height of each story card based on the browser window size, minimum width, maximum width, and aspect ratio.
     * @return void
     */
        setStoryProps: function () {
        const minWidth = 240;
        const maxWidth = 300;
        const aspectRatio = 2 / 3;
        const width = Math.max(minWidth, Math.min(maxWidth, Math.round(window.innerWidth / 3)));
        this.story = {
            width: width,
            height: Math.round(width * aspectRatio),
            style: `width: ${width}px; height: ${Math.round(width * aspectRatio)}px; overflow: hidden;`,
        };
    },
    /**
     * Delete all empty text nodes in the root element recursively.
     * @return void
     */
    removeEmptyTextNodes: function () {
        this.root.innerHTML = this.root.innerHTML.replace(/\n?\s\s+/g, '');
    },
    /**
     * Wrap goal description in a span.goal element.
     * @return void
     */
    wrapGoal: function () {
        this.goal = document.createElement('span');
        // this.goal.tabIndex = 1;
        this.goal.classList.add('story', 'goal');
        this.goal.style.cssText = this.story.style;
        this.goal.appendChild(this.root.childNodes[0].childNodes[0].cloneNode(true));
        this.root.childNodes[0].replaceChild(this.goal, this.root.childNodes[0].childNodes[0]);
    },
    /**
     * Wrap steps to the goal.
     * @return void
     */
    wrapSteps: function () {
        const steps = this.root.querySelectorAll(':scope > li > ol > li');
        for (var i = 0; i < steps.length; i++) {
            const step = document.createElement('span');
            // step.tabIndex = i + 2;
            step.classList.add('story', 'step');
            step.style.cssText = this.story.style;
            step.appendChild(steps[i].childNodes[0].cloneNode(true));
            steps[i].replaceChild(step, steps[i].childNodes[0]);
        }
    },
    /**
     * Wrap tasks.
     * @return void
     */
    wrapTasks: function () {
        const steps = this.root.querySelectorAll(':scope > li > ol > li');
        // let tabIndex = steps.length + 2;
        for (let i = 0; i < steps.length; i++) {
            const tasks = steps[i].querySelectorAll(':scope > ol > li');
            for (let j = 0; j < tasks.length; j++) {
                const task = document.createElement('span');
                // task.tabIndex = tabIndex++;
                task.classList.add('story', 'task');
                task.style.cssText = this.story.style;
                task.appendChild(tasks[j].childNodes[0].cloneNode(true));
                tasks[j].replaceChild(task, tasks[j].childNodes[0]);
            }
        }
    },
    /**
     * Make each story card draggable.
     * @return void
     */
    makeDraggable: function () {
        let dragging;
        const stories = this.root.querySelectorAll('.story');
        for (let i = 0; i < stories.length; i++) {
            stories[i].draggable = true;
        }
        function isDraggable(element) {
            return element.classList.contains('story') && !element.classList.contains('goal');
        }
        this.root.addEventListener("dragstart", (event) => {
            if (isDraggable(event.srcElement)) {
                dragging = event.srcElement;
                event.dataTransfer.setData("text/plain", event.srcElement.innerHTML);
                event.dataTransfer.effectAllowed = "move";
            }
        });
        this.root.addEventListener("dragover", (event) => {
            if (isDraggable(event.srcElement) && event.dataTransfer.effectAllowed === "move") {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
            }
        });
        this.root.addEventListener("drop", (event) => {
            if (isDraggable(event.srcElement) && event.dataTransfer.effectAllowed === "move") {
                event.preventDefault();
                dragging.innerHTML = event.srcElement.innerHTML;
                event.srcElement.innerHTML = event.dataTransfer.getData("text/plain");
                dragging = null;
            }
        });
    },
    /**
     * Make each text node editable.
     * @return void
     */
    observeEditable: function () {
        this.editing = false;
        this.root.addEventListener("click", (event) => {
            if (!this.editing && event.target.classList.contains("story")) {
                this.editing = true;
                const stories = this.root.querySelectorAll('.story');
                for (let i = 0; i < stories.length; i++) {
                    stories[i].contentEditable = true;
                }
                event.target.focus();
            }
        });
        this.root.addEventListener("blur", (event) => {
            if (this.editing && event.target.classList.contains("story")) {
                this.editing = false;
                const stories = this.root.querySelectorAll('.story');
                for (let i = 0; i < stories.length; i++) {
                    stories[i].contentEditable = false;
                }
            }
        });
    },
    /**
     * Create buttons to add or delete a step or task.
     * @return void
     */
    observeAddRemoveButtons: function () {
        const buttonsWrapper = document.createElement('div');
        buttonsWrapper.classList.add('buttons', 'add-remove-buttons');
        buttonsWrapper.style.cssText = 'position: relative; height: 1px; margin-bottom: -1px; text-align: right; padding-right: 3px;';

        const buttonStyles = "display: inline-block; padding: 0; margin-left: 2px; font: bold 18pt/1px monospace; width: 20px; height: 20px; vertical-align: middle; text-align: center; box-sizing: border-box; position: relative; top: -27px; background-color: #000; color: #FFF;";

        const addButton = document.createElement('button');
        addButton.classList.add('add');
        addButton.innerHTML = '&#x2b;';
        addButton.style.cssText = buttonStyles;
        addButton.addEventListener("click", (event) => {
            if (event.target.parentNode.previousSibling.classList.contains('step')) {
                this.addStepAfter(event.target.parentNode.parentNode);
            } else if (event.target.parentNode.previousSibling.classList.contains('task')) {
                this.addTaskAfter(event.target.parentNode.parentNode);
            }
        });

        const nextStepButton = document.createElement('button');
        nextStepButton.classList.add('next-step');
        nextStepButton.innerHTML = '&#x2192;';
        nextStepButton.style.cssText = buttonStyles;
        nextStepButton.addEventListener("click", (event) => {
            if (event.target.parentNode.parentNode.nextSibling) {
                event.target.parentNode.parentNode.nextSibling.childNodes[0].focus();
            }
        });

        const removeButton = document.createElement('button');
        removeButton.classList.add('remove');
        removeButton.innerHTML = '&#xd7;';
        removeButton.style.cssText = buttonStyles;
        removeButton.addEventListener("click", (event) => {
            if (event.target.parentNode.previousSibling.classList.contains('step')) {
                this.removeStep(event.target.parentNode.parentNode);
            } else if (event.target.parentNode.previousSibling.classList.contains('task')) {
                this.removeTask(event.target.parentNode.parentNode);
            }
        });

        buttonsWrapper.appendChild(addButton);
        buttonsWrapper.appendChild(nextStepButton);
        buttonsWrapper.appendChild(removeButton);



        this.root.addEventListener("focusin", (event) => {
            if (event.target.classList.contains("story")) {
                if (event.target.classList.contains("goal")) {
                    if (buttonsWrapper.parentNode) {
                        buttonsWrapper.parentNode.removeChild(buttonsWrapper);
                    }
                } else {
                    event.target.parentNode.insertBefore(buttonsWrapper, event.target.nextSibling);
                }
            }
        });
    },
    /**
        * Add a step.
        * @param {HTMLElement} step - The step to add a new step after.
        * @return void
        */
    addStepAfter: function (step) {
        const newStep = document.createElement('li');
        const editable = this.editing ? ' contenteditable="true"' : '';
        newStep.innerHTML = `<span class="story step" draggable="true"${editable} style="${this.story.style}"></span><ol><li><span class="story task" draggable="true"${editable} style="${this.story.style}"></span></li></ol>`;
        console.log(newStep.innerHTML, newStep);
        if (step.nextSibling) {
            step.parentNode.insertBefore(newStep, step.nextSibling);
        } else {
            step.parentNode.appendChild(newStep);
        }
    },
    /**
        * Add a task.
        * @param {HTMLElement} task - The task to add a new task after.
        * @return void
        */
    addTaskAfter: function (task) {
        const newTask = document.createElement('li');
        const editable = this.editing ? ' contenteditable="true"' : '';
        newTask.innerHTML = `<span class="story task" draggable="true"${editable} style="${this.story.style}></span>`;
        if (task.nextSibling) {
            task.parentNode.insertBefore(newTask, task.nextSibling);
        } else {
            task.parentNode.appendChild(newTask);
        }
    },
    /**
        * Remove a step.
        * @param {HTMLElement} step - The step to remove.
        * @return void
        */
    removeStep: function (step) {
        step.parentNode.removeChild(step);
    },
    /**
        * Remove a task.
        * @param {HTMLElement} task - The task to remove.
        * @return void
        */
    removeTask: function (task) {
        task.parentNode.removeChild(task);
    },
};

export default StoryMap;
