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
            let {picBytes, index, total, prefix, end} = msg

            let frames = figma.currentPage.selection;
            frames = Array.from(frames).sort((a: FrameNode, b: FrameNode) => {
                return a.y === b.y ? a.x - b.x : a.y - b.y
            })
            console.log(`【框选frame】${frames.length}个`);

            let slots: RectangleNode[] = []
            let pickSlots = function (node) {
                for (const child of node.children) {
                    switch (child.type) {
                        case 'FRAME':
                        case 'GROUP':
                            pickSlots(child)
                            break;
                        case 'RECTANGLE':
                            if (child.name.startsWith(prefix)) {
                                // console.log(`【找到slot】${child.name}`)
                                slots.push(child);
                            }
                            break;
                    }
                }
            }
            frames.forEach(pickSlots)
            console.log(`【slot数量】${slots.length}个`)

            let rect: RectangleNode = slots[index]
            if (rect === undefined) {
                console.log(`【paste结束，图片数量大于slot数量】`)
                return;
            }


            const newFills = [];
            let imagePaint = /*rect.fills.find((p) => p.type === 'IMAGE');*/ undefined
            let newPaint
            if (imagePaint !== undefined) {
                newPaint = JSON.parse(JSON.stringify(imagePaint))
            } else {
                newPaint = JSON.parse(`
{
    "type": "IMAGE",
    "visible": true,
    "opacity": 1,
    "blendMode": "NORMAL",
    "scaleMode": "FILL",
    "imageTransform": [
        [
            1,
            0,
            0
        ],
        [
            0,
            1,
            0
        ]
    ],
    "scalingFactor": 0.5,
    "rotation": 0,
    "filters": {
        "exposure": 0,
        "contrast": 0,
        "saturation": 0,
        "temperature": 0,
        "tint": 0,
        "highlights": 0,
        "shadows": 0
    },
    "imageHash": "-"
}`)
            }
            newPaint.imageHash = figma.createImage(picBytes).hash
            newFills.push(newPaint)

            rect.fills = newFills;

//             for (let i = 0; i < slots.length; i++) {
//                 let rect: RectangleNode = slots[i];
//                 if (rect === undefined) {
//                     console.log('pop is undefined')
//                     break;
//                 }
//
//                 let bytes = picData[i]
//                 const newFills = [];
//
//                 let imagePaint = /*rect.fills.find((p) => p.type === 'IMAGE');*/ undefined
//                 let newPaint
//                 if (imagePaint !== undefined) {
//                     newPaint = JSON.parse(JSON.stringify(imagePaint))
//                 } else {
//                     newPaint = JSON.parse(`
// {
//     "type": "IMAGE",
//     "visible": true,
//     "opacity": 1,
//     "blendMode": "NORMAL",
//     "scaleMode": "FILL",
//     "imageTransform": [
//         [
//             1,
//             0,
//             0
//         ],
//         [
//             0,
//             1,
//             0
//         ]
//     ],
//     "scalingFactor": 0.5,
//     "rotation": 0,
//     "filters": {
//         "exposure": 0,
//         "contrast": 0,
//         "saturation": 0,
//         "temperature": 0,
//         "tint": 0,
//         "highlights": 0,
//         "shadows": 0
//     },
//     "imageHash": "-"
// }`)
//                 }
//                 newPaint.imageHash = figma.createImage(bytes).hash
//                 newFills.push(newPaint)
//
//                 rect.fills = newFills;
//             }

            // if (end) {
            //     figma.closePlugin();
            // }
            break;
        case 'cancel':
            break;
    }
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
