figma.showUI(__html__,{
    title: 'Qing',
    width: 290,
    height: 540,
});

figma.ui.onmessage = async msg => {
    switch (msg.type) {
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


            for (let i = index; i < slots.length; i += total) {
                let rect: RectangleNode = slots[i]
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
            }
            break;
        case 'cancel':
            break;
    }
};
