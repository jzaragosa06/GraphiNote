

const toggleWordEditorBtn = document.getElementById('toggleWordEditor');
const wordEditor = document.querySelector('.word-editor');
let wordEditorVisible = false;

//initial color of toggleWordEditorBtn
toggleWordEditorBtn.style.background = '#808080';

tinymce.init({
    selector: '#myTextarea',
    height: '100%',
    plugins: [
        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
        'insertdatetime', 'media', 'table', 'help', 'wordcount',
    ],
    toolbar: 'undo redo | blocks | ' +
        'bold italic backcolor | alignleft aligncenter ' +
        'alignright alignjustify | bullist numlist outdent indent | ' +
        'removeformat | help',
    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }'
});

document.getElementById('toggleWordEditor').addEventListener('click', function ()
{
    const editor = document.getElementById('wordEditor');
    document.body.classList.toggle('editor-visible');

    if (wordEditorVisible)
    {
        //if visible -> revert
        wordEditorVisible = false;
        wordEditor.style.display = 'none';
        toggleWordEditorBtn.style.background = '#808080';
    }
    else
    {
        wordEditorVisible = true;
        wordEditor.style.display = 'block';
        toggleWordEditorBtn.style.background = '#442bff';
    }
});





const combineIntoWordBtn = document.getElementById('combineIntoWord');
const selectionUI = document.getElementById('selectionUI');
let selectedContainers = new Set();

let wordEditorVersions = [];
let currentVersionIndex = -1;

combineIntoWordBtn.addEventListener('click', () =>
{
    // Enable selection mode
    selectedContainers.clear();
    selectionUI.style.display = 'block';
    document.querySelectorAll('.note-container').forEach(container =>
    {
        container.style.cursor = 'pointer';
        container.addEventListener('click', toggleContainerSelection);
    });
});

function toggleContainerSelection(e)
{
    const container = e.currentTarget;
    if (selectedContainers.has(container))
    {
        selectedContainers.delete(container);
        container.classList.remove('selected');
    } else
    {
        selectedContainers.add(container);
        container.classList.add('selected');
    }
}

function cancelProcess()
{
    selectedContainers.clear();
    selectionUI.style.display = 'none';

    document.querySelectorAll(".note-container").forEach((container) =>
    {
        container.classList.remove("selected");
        container.removeEventListener('click', toggleContainerSelection);
        container.style.cursor = 'default';
    });

}

function processSelectedContainers()
{
    if (selectedContainers.size === 0)
    {
        alert('Please select at least one container.');
        return;
    }

    let combinedContent = '';
    selectedContainers.forEach(container =>
    {
        const title = container.querySelector('.note-title').textContent;
        const content = container.querySelector('.note-content').textContent;
        combinedContent += `<h2>${title}</h2><p>${content}</p>`;
    });

    //save the previous content
    saveVersion(combinedContent);

    // Insert combined content into TinyMCE editor
    tinymce.get('myTextarea').setContent(combinedContent);

    // Reset selection mode
    selectedContainers.forEach(container =>
    {
        container.classList.remove('selected');
        container.removeEventListener('click', toggleContainerSelection);
    });

    selectedContainers.clear();
    selectionUI.style.display = 'none';
    document.querySelectorAll('.note-container').forEach(container =>
    {
        container.style.cursor = 'default';
    });

    // Show the word editor if it's hidden
    wordEditorVisible = true;
    wordEditor.style.display = 'block';
    toggleWordEditorBtn.style.background = '#442bff';


}

function saveVersion(content)
{
    wordEditorVersions.push({
        timestamp: Date.now(),
        content: content,
    });

    currentVersionIndex = wordEditorVersions.length - 1;
    //update the ui
    updateVersionUI();
}

function updateVersionUI()
{
    const versionContainer = document.getElementById("word-editor-content-version");
    versionContainer.innerHTML = '';

    wordEditorVersions.forEach((version, index) =>
    {
        const button = document.createElement("button");
        button.className = `version-button ${index === currentVersionIndex ? 'active' : ''}`;

        const versionNumber = document.createElement("span");
        versionNumber.className = "version-number";
        versionNumber.textContent = index + 1;

        const details = document.createElement("div");
        details.className = "version-details";
        details.innerHTML = `
                                    <span>Version ${index + 1}</span>
                                    <span>${new Date(version.timestamp).toLocaleDateString()}</span>
                                    `;

        button.appendChild(versionNumber);
        button.appendChild(details);
        button.addEventListener("click", () => loadVersion(index));

        versionContainer.appendChild(button);
    });
}

function loadVersion(index)
{
    //update the current index
    currentVersionIndex = index;
    tinymce.get("myTextarea").setContent(wordEditorVersions[index].content)
    updateVersionUI();
}

const toggleLabelsBtn = document.getElementById('toggleLabels');
toggleLabelsBtn.addEventListener('click', toggleLabelsVisibility);

function toggleLabelsVisibility()
{
    const labels = document.querySelectorAll('.connection-label');
    let allHidden = true; // Assume all labels are hidden initially

    labels.forEach(label =>
    {
        if (label.style.display !== 'none')
        {
            allHidden = false; // If any label is visible, set allHidden to false
        }
        label.style.display = label.style.display === 'none' ? 'block' : 'none';
    });

    // Update button color based on label visibility
    if (allHidden)
    {
        toggleLabelsBtn.style.backgroundColor = '#442bff'; // Blue when labels are shown
    } else
    {
        toggleLabelsBtn.style.backgroundColor = '#808080'; // Gray when labels are hidden
    }
}

function generateAppState()
{
    const appState = {
        notes: [],
        connections: []
    };

    // Iterate over all note containers
    document.querySelectorAll('.note-container').forEach(note =>
    {
        const noteData = {
            id: note.id || Date.now(), // Assign a unique ID if not already present
            title: note.querySelector('.note-title').textContent,
            content: note.querySelector('.note-content').textContent,
            position: {
                x: parseInt(note.style.left),
                y: parseInt(note.style.top)
            },
            originNote: note.originNote ? note.originNote.id : null
        };
        appState.notes.push(noteData);
    });

    // Iterate over all connections
    connections.forEach((conn, note) =>
    {
        conn.outgoing.forEach(out =>
        {
            const connectionData = {
                from: note.id || note.originNote.id,
                to: out.target.id || out.target.originNote.id,
                label: out.label.textContent
            };
            appState.connections.push(connectionData);
        });
    });

    return appState;
}

const app = document.getElementById('app');
const addNewContainerBtn = document.getElementById('addNewContainer');
const toggleColorsBtn = document.getElementById('toggleColors');
let activeNote = null;
let initialX = 0;
let initialY = 0;
let connectingMode = false;
let sourceNote = null;
const connections = new Map();

const originColors = new Map();
let colorIndex = 0;

const baseColors = [
    { h: 200, s: 30, l: 90 },
    { h: 150, s: 30, l: 90 },
    { h: 25, s: 30, l: 90 },
    { h: 280, s: 30, l: 90 },
    { h: 350, s: 30, l: 90 },
    { h: 60, s: 30, l: 90 },
];

let colorsEnabled = true;

// AI Modal related variables
const aiModal = document.getElementById('aiModal');
let aiSourceNote = null;

function getColorForOrigin(origin)
{
    if (!originColors.has(origin))
    {
        const baseColor = baseColors[colorIndex % baseColors.length];
        originColors.set(origin, baseColor);
        colorIndex++;
    }
    return originColors.get(origin);
}

function createNote(x, y, parentNote = null, originNote = null)
{
    const note = document.createElement('div');
    note.className = 'note-container';
    note.style.left = `${x}px`;
    note.style.top = `${y}px`;
    note.id = `note-${Date.now()}`;
    note.originNote = originNote || note;

    const color = getColorForOrigin(note.originNote);
    note.style.backgroundColor = `hsl(${color.h}, ${color.s}%, ${color.l}%)`;

    if (!colorsEnabled)
    {
        note.classList.add('no-color');
    }

    connections.set(note, {
        incoming: [],
        outgoing: []
    });

    const dragHandle = document.createElement('div');
    dragHandle.className = 'drag-handle';
    dragHandle.textContent = '⋮⋮';

    const title = document.createElement('div');
    title.className = 'note-title';
    title.contentEditable = true;
    title.textContent = 'Note Title';

    const content = document.createElement('div');
    content.className = 'note-content';
    content.contentEditable = true;
    content.textContent = 'Enter your text here...';

    const addButton = document.createElement('button');
    addButton.className = 'add-button';
    addButton.textContent = '+';
    addButton.title = 'Add connected note';

    const aiButton = document.createElement('button');
    aiButton.className = 'ai-button';
    aiButton.textContent = 'AI';
    aiButton.title = 'Generate AI note';

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.textContent = '×';
    deleteButton.title = 'Delete note';

    const expandButton = document.createElement('button');
    expandButton.className = 'expand-button';
    expandButton.textContent = '↕';
    expandButton.title = 'Expand/Collapse note';

    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';
    note.appendChild(resizeHandle);

    // Add event listener for resizing
    resizeHandle.addEventListener('mousedown', (e) =>
    {
        e.preventDefault();
        const startWidth = note.offsetWidth;
        const startX = e.clientX;

        function onMouseMove(e)
        {
            const newWidth = startWidth + (e.clientX - startX);
            note.style.width = `${newWidth}px`;
            updateLines(note); // Update lines when resizing
        }

        function onMouseUp()
        {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    aiButton.addEventListener('click', () =>
    {
        aiSourceNote = note;
        openAIModal();
    });

    expandButton.addEventListener('click', () =>
    {
        note.classList.toggle('collapsed');
        if (note.classList.contains('collapsed'))
        {
            expandButton.textContent = '↕'; // Change button text to indicate collapsed state
            note.style.height = 'auto'; // Adjust height to fit only the visible elements
        } else
        {
            expandButton.textContent = '↕'; // Change button text to indicate expanded state
            note.style.height = 'auto'; // Reset height to fit the content
        }
    });

    note.appendChild(dragHandle);
    note.appendChild(title);
    note.appendChild(content);
    note.appendChild(addButton);
    note.appendChild(aiButton);
    note.appendChild(deleteButton);
    note.appendChild(expandButton);
    app.appendChild(note);

    dragHandle.addEventListener('mousedown', dragStart);

    function dragStart(e)
    {
        if (e.target === content) return;
        if (connectingMode) return;

        activeNote = note;
        note.classList.add('dragging');

        initialX = e.clientX - note.offsetLeft;
        initialY = e.clientY - note.offsetTop;
    }

    addButton.addEventListener('click', () =>
    {
        const newNote = createNote(
            parseInt(note.style.left) + 500 + (Math.random() * 100),
            parseInt(note.style.top) + (Math.random() * 150),
            note,
            note.originNote
        );

        createConnection(note, newNote);
        console.log("new container from the preceding is created: ", generateAppState());
    });

    deleteButton.addEventListener('click', () =>
    {
        const noteConnections = connections.get(note);
        noteConnections.incoming.forEach(conn =>
        {
            conn.line.remove();
            conn.label.remove();  // Remove the label
            const sourceConnections = connections.get(conn.source);
            sourceConnections.outgoing = sourceConnections.outgoing.filter(out => out.target !== note);
        });
        noteConnections.outgoing.forEach(conn =>
        {
            conn.line.remove();
            conn.label.remove();  // Remove the label
            const targetConnections = connections.get(conn.target);
            targetConnections.incoming = targetConnections.incoming.filter(incoming => incoming.source !== note);
        });

        connections.delete(note);
        note.remove();
        console.log("container is deleted: ", generateAppState());
    });

    note.addEventListener('click', (e) =>
    {
        if (!connectingMode || note === sourceNote) return;

        createConnection(sourceNote, note);
        exitConnectingMode();
    });

    const positions = ['top', 'right', 'bottom', 'left'];
    positions.forEach(pos =>
    {
        const point = document.createElement('div');
        point.className = `connection-point ${pos}`;
        point.dataset.position = pos;
        point.addEventListener('mousedown', startConnection);
        note.appendChild(point);
    });

    return note;
}

let tempLine = null;
let startPoint = null;

function startConnection(e)
{
    e.stopPropagation();
    const point = e.target;
    const sourceNote = point.parentElement;
    const position = point.dataset.position;
    startPoint = {
        note: sourceNote,
        position: position,
        x: sourceNote.offsetLeft + (position === 'right' ? sourceNote.offsetWidth :
            position === 'left' ? 0 : sourceNote.offsetWidth / 2),
        y: sourceNote.offsetTop + (position === 'bottom' ? sourceNote.offsetHeight :
            position === 'top' ? 0 : sourceNote.offsetHeight / 2)
    };

    tempLine = document.createElement('div');
    tempLine.className = 'temp-line';
    app.appendChild(tempLine);

    document.addEventListener('mousemove', dragConnection);
    document.addEventListener('mouseup', endConnection);
}

function dragConnection(e)
{
    if (!tempLine || !startPoint) return;

    const endX = e.clientX - app.offsetLeft;
    const endY = e.clientY - app.offsetTop;

    const length = Math.sqrt(Math.pow(endX - startPoint.x, 2) + Math.pow(endY - startPoint.y, 2));
    const angle = Math.atan2(endY - startPoint.y, endX - startPoint.x);

    tempLine.style.width = `${length}px`;
    tempLine.style.left = `${startPoint.x}px`;
    tempLine.style.top = `${startPoint.y}px`;
    tempLine.style.transform = `rotate(${angle}rad)`;
    tempLine.style.transformOrigin = '0 0';
}

function endConnection(e)
{
    document.removeEventListener('mousemove', dragConnection);
    document.removeEventListener('mouseup', endConnection);

    const targetElement = document.elementFromPoint(e.clientX, e.clientY);
    if (targetElement && targetElement.classList.contains('connection-point'))
    {
        const endNote = targetElement.parentElement;
        const endPosition = targetElement.dataset.position;

        if (endNote !== startPoint.note)
        {
            createConnection(startPoint.note, endNote, {
                startSocket: startPoint.position,
                endSocket: endPosition
            });
        }
    }

    if (tempLine)
    {
        tempLine.remove();
        tempLine = null;
    }
    startPoint = null;
}

function createConnection(from, to, options = {})
{
    const line = new LeaderLine(
        from,
        to,
        {
            color: '#999',
            size: 2,
            path: 'fluid',
            startSocket: options.startSocket || 'right',
            endSocket: options.endSocket || 'left',
            dropShadow: false,
            startPlug: 'behind',
            endPlug: 'arrow1',
            dash: { animation: true }
        }
    );

    // Create label element
    const label = document.createElement('div');
    label.className = 'connection-label';
    label.textContent = options.label || 'Relationship';
    label.contentEditable = true;

    // Create delete button for the label
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-label-button';
    deleteButton.textContent = '×';
    deleteButton.title = 'Delete connection';
    deleteButton.style.display = 'none'; // Hide by default
    label.appendChild(deleteButton);

    // Show delete button on label hover
    label.addEventListener('mouseenter', () =>
    {
        deleteButton.style.display = 'block';
    });

    label.addEventListener('mouseleave', () =>
    {
        deleteButton.style.display = 'none';
    });

    // Delete the connection when the delete button is clicked
    deleteButton.addEventListener('click', (e) =>
    {
        e.stopPropagation(); // Prevent label editing when clicking the delete button
        line.remove();
        label.remove();

        // Remove the connection from the connections map
        const fromConnections = connections.get(from);
        const toConnections = connections.get(to);

        if (fromConnections)
        {
            fromConnections.outgoing = fromConnections.outgoing.filter(out => out.target !== to);
        }

        if (toConnections)
        {
            toConnections.incoming = toConnections.incoming.filter(incoming => incoming.source !== from);
        }

        console.log("connection is deleted: ", generateAppState());
    });

    document.body.appendChild(label);

    // Update label position initially
    updateLabelPosition(from, to, label);

    // Make the label editable
    label.addEventListener('blur', () =>
    {
        if (label.textContent.trim() === '')
        {
            label.textContent = 'Connection';
        }
    });

    // Store connection information
    connections.get(from).outgoing.push({ target: to, line, label });
    connections.get(to).incoming.push({ source: from, line, label });

    console.log("connection is created: ", generateAppState());
}

function updateLabelPosition(from, to, label)
{
    const fromRect = from.getBoundingClientRect();
    const toRect = to.getBoundingClientRect();

    // Calculate the midpoint between the two notes
    const midX = (fromRect.left + toRect.left) / 2 + (fromRect.width + toRect.width) / 4;
    const midY = (fromRect.top + toRect.top) / 2 + (fromRect.height + toRect.height) / 4;

    // Position the label
    label.style.left = `${midX - label.offsetWidth / 2}px`;
    label.style.top = `${midY - label.offsetHeight / 2}px`;
}

function enterConnectingMode(note)
{
    connectingMode = true;
    sourceNote = note;
    document.body.style.cursor = 'crosshair';

    document.querySelectorAll('.note-container').forEach(container =>
    {
        if (container !== note)
        {
            container.classList.add('highlight-connectable');
        }
    });
}

function exitConnectingMode()
{
    connectingMode = false;
    sourceNote = null;
    document.body.style.cursor = 'default';

    document.querySelectorAll('.note-container').forEach(container =>
    {
        container.classList.remove('highlight-connectable');
    });
}

addNewContainerBtn.addEventListener('click', () =>
{
    const appRect = app.getBoundingClientRect();
    const x = Math.random() * (appRect.width - 300) + 220;
    const y = Math.random() * (appRect.height - 200) + 50;

    createNote(x, y);
});

let animationFrameId = null;

function drag(e)
{
    if (activeNote)
    {
        e.preventDefault();

        const currentX = e.clientX - initialX;
        const currentY = e.clientY - initialY;

        activeNote.style.left = `${currentX}px`;
        activeNote.style.top = `${currentY}px`;

        if (animationFrameId)
        {
            cancelAnimationFrame(animationFrameId);
        }

        animationFrameId = requestAnimationFrame(() =>
        {
            updateLines(activeNote);
        });
    }
}

function dragEnd(e)
{
    if (activeNote)
    {
        activeNote.classList.remove('dragging');
        updateLines(activeNote);
        activeNote = null;
        if (animationFrameId)
        {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }
}

function updateLines(note)
{
    if (!note || !connections.has(note)) return;

    const noteConnections = connections.get(note);

    noteConnections.incoming.forEach(conn =>
    {
        conn.line.position();
        updateLabelPosition(conn.source, note, conn.label);
    });

    noteConnections.outgoing.forEach(conn =>
    {
        conn.line.position();
        updateLabelPosition(note, conn.target, conn.label);
    });
}

document.addEventListener('mousemove', drag);
document.addEventListener('mouseup', dragEnd);

const firstNote = createNote(300, 100);

// AI Modal functions
function openAIModal()
{
    aiModal.style.display = 'flex';
}

function closeAIModal()
{
    aiModal.style.display = 'none';
}

function handleAISubmit()
{
    const prompt = document.getElementById('aiPrompt').value;
    if (prompt.trim() === '')
    {
        alert('Please enter a prompt.');
        return;
    }

    const newNote = createNote(
        parseInt(aiSourceNote.style.left) + 500 + (Math.random() * 100),
        parseInt(aiSourceNote.style.top) + (Math.random() * 150),
        aiSourceNote,
        aiSourceNote.originNote
    );

    createConnection(aiSourceNote, newNote, { label: prompt });
    closeAIModal();
    document.getElementById('aiPrompt').value = '';
}

// Toggle colors functionality
toggleColorsBtn.addEventListener('click', () =>
{
    colorsEnabled = !colorsEnabled;
    document.querySelectorAll('.note-container').forEach(note =>
    {
        if (colorsEnabled)
        {
            note.classList.remove('no-color');
            const color = getColorForOrigin(note.originNote);
            note.style.backgroundColor = `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
        } else
        {
            note.classList.add('no-color');
            note.style.backgroundColor = 'white';
        }

        if (colorsEnabled)
        {
            toggleColorsBtn.style.backgroundColor = '#442bff'; // Blue when colors are shown
        } else
        {
            toggleColorsBtn.style.backgroundColor = '#808080'; // Gray when colors are hidden
        }
    });
});