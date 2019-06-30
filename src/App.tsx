import * as React from "react";
import { useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import SignaturePad from "react-signature-pad-wrapper";

const App: React.FC = () => {
  const [model, setModel] = useState(null);
  const [signaturePad, setSignaturePad] = useState(null);
  const [maxAccuracy, setMaxAccuracy] = useState("-");

  useEffect(() => {
    tf.loadLayersModel(
      "https://raw.githubusercontent.com/tsu-nera/tfjs-mnist-study/master/model/model.json"
    ).then(model => {
      setModel(model);
    });
  }, []);

  const getImageData = () => {
    return new Promise(resolve => {
      const context = document.createElement("canvas").getContext("2d");

      const image = new Image();
      const width = 28;
      const height = 28;

      image.onload = () => {
        context.drawImage(image, 0, 0, width, height);
        const imageData = context.getImageData(0, 0, width, height);

        for (let i = 0; i < imageData.data.length; i += 4) {
          const avg =
            (imageData.data[i] +
              imageData.data[i + 1] +
              imageData.data[i + 2]) /
            3;

          imageData.data[i] = avg;
          imageData.data[i + 1] = avg;
          imageData.data[i + 2] = avg;
        }

        resolve(imageData);
      };

      image.src = signaturePad.toDataURL();
    });
  };

  const getAccuracyScores = imageData => {
    return tf.tidy(() => {
      const channels = 1;
      let input = tf.browser.fromPixels(imageData, channels);
      input = tf.cast(input, "float32").div(tf.scalar(255));
      input = input.expandDims();

      return model.predict(input).dataSync();
    });
  };

  const predict = () => {
    getImageData()
      .then(imageData => getAccuracyScores(imageData))
      .then(accuracyScores => {
        const maxAccuracy = accuracyScores.indexOf(
          Math.max.apply(null, accuracyScores)
        );
        setMaxAccuracy(maxAccuracy);
      });
  };

  const reset = () => {
    signaturePad.instance.clear();
    setMaxAccuracy("-");
  };

  return (
    <div className="container">
      <h1 className="title has-text-centered">
        手書き文字認識
      </h1>
      <div className="columns is-centered">
        <div className="column is-3">
          <SignaturePad
            width={280}
            height={280}
            options={{
              minWidth: 6,
              maxWidth: 6,
              penColor: "white",
              backgroundColor: "black"
            }}
            ref={ref => setSignaturePad(ref)}
          />
          <div className="field is-grouped">
            <p className="control">
              <a className="button is-link" onClick={predict}>
                Predict
              </a>
            </p>
            <p className="control">
              <a className="button is-light" onClick={reset}>
                Reset
              </a>
            </p>
          </div>
        </div>
        <div className="column is-3">推定結果：{maxAccuracy}</div>
      </div>
    </div>
  );
};

export default App;
