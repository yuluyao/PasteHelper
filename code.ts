// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__);


// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = async msg => {
    // One way of distinguishing between different types of messages sent from
    // your HTML page is to use an object with a "type" property like this.
    switch (msg.type) {
        case 'create-rect':

            break;
        case 'invert-image':

            break;
        case 'paste-picture':
            console.log('收到消息');

            let {picData} = msg


            let frames = figma.currentPage.selection;
            let slots: RectangleNode[] = []
            let pickQingyun = (node) => {
                for (const child of node.children) {
                    switch (child.type) {
                        case 'RECTANGLE':
                            if (child.name.startsWith('qingyun')) {
                                slots.push(child);
                            }
                            break;
                        case 'GROUP':
                            pickQingyun(child)
                            break;
                    }
                }
            }
            frames.forEach(pickQingyun)

            console.log(`slots.length is ${slots.length}`)
            for (let i = 0; i < picData.length && i < frames.length; i++) {
                let pop: RectangleNode = slots.pop();
                if (pop === undefined) {
                    console.log('pop is undefined')
                    break;
                }

                let bytes = picData[i]
                const newFills = [];
                for (const paint of pop.fills) {
                    if (paint.type === 'IMAGE') {
                        const newPaint = JSON.parse(JSON.stringify(paint))
                        console.log(`paint --> ${JSON.stringify(paint)}`)
                        newPaint.imageHash = figma.createImage(bytes).hash
                        newFills.push(newPaint)
                    }
                }
                pop.fills = newFills
            }

            break;
        case  'cancel':

            break;
    }
    figma.closePlugin();
};


// async function invertImages(node) {
//     const newFills = []
//     for (const paint of node.fills) {
//         if (paint.type === 'IMAGE') {
//             // Get the (encoded) bytes for this image.
//             const image = figma.getImageByHash(paint.imageHash)
//             const bytes = await image.getBytesAsync()
//
//             // Create an invisible iframe to act as a "worker" which
//             // will do the task of decoding and send us a message
//             // when it's done.
//             figma.showUI(__html__, {visible: false})
//
//             // Send the raw bytes of the file to the worker.
//             figma.ui.postMessage({type: 'invert', bytes})
//
//             // Wait for the worker's response.
//             const newBytes = await new Promise((resolve, reject) => {
//                 figma.ui.onmessage = value => resolve(value)
//             })
//
//             // Create a new paint for the new image.
//             const newPaint = JSON.parse(JSON.stringify(paint))
//             newPaint.imageHash = figma.createImage(newBytes).hash
//             newFills.push(newPaint)
//         }
//     }
//     node.fills = newFills
// }
