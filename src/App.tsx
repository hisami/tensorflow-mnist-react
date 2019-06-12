import * as React from 'react'
import {useState, useEffect} from "react"
import * as tf from '@tensorflow/tfjs'
import SignaturePad from 'react-signature-pad-wrapper'

const App: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [model, setModel] = useState(null)
    const [signaturePad, setSignaturePad] = useState(null)

    useEffect(() => {
        tf.loadLayersModel(
            'https://raw.githubusercontent.com/tsu-nera/tfjs-mnist-study/master/model/model.json'
        ).then(model => {
            setIsLoading(false)
            setModel(model)
        })
    }, [])

    const getImageData = () => {
        return new Promise(resolve => {
            const context = document.createElement('canvas').getContext('2d')

            const image = new Image()
            const width = 28
            const height = 28

            image.onload = () => {
                context.drawImage(image, 0, 0, width, height)
                const imageData = context.getImageData(0, 0, width, height)

                console.log(imageData.data)

                resolve(imageData)
            }

            image.src = signaturePad.toDataURL()
        })
    }

    const predict = () => {
        getImageData().then(() => console.log('処理終了'))
    }

    return (
        <div className="container">
            <h1 className="title">
                MNIST recognition with TensorFlow.js
            </h1>
            <SignaturePad
                width={280}
                height={280}
                options={{
                    penColor: "white",
                    backgroundColor: "black"
                }}
                ref={ref => setSignaturePad(ref)}
            />
            <div className="field is-grouped">
                <p className="control">
                    <a className="button is-primary" onClick={predict}>Predict</a>
                </p>
                <p className="control">
                    <a className="button is-light">Reset</a>
                </p>
            </div>
        </div>
    )
}

export default App
