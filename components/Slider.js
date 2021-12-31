import React, { useState } from 'react';
import { useRanger } from "react-ranger";
//import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css';
//import RangeSlider from 'react-bootstrap-range-slider';

const Slider = ({_updateOpenFunc}) => {

    const [values, setValues] = useState([1]);

    var wait = false;

    function queuedOpen() {
      _updateOpenFunc("C", value[0]);
    }


    function updateOpen(value) {
      if (values[0] == value[0]) {
        return;
      }
      if (wait) {
        console.log("waiting");
        setTimeout(queuedOpen, 200);
      } else {
        wait = true;
        _updateOpenFunc("C", value[0]);  
        wait = false
      }
      setValues(value); 
 
    }

    const { getTrackProps, handles } = useRanger({
      min: 1,
      max: 5,
      stepSize: 1,
      values,
      onDrag: updateOpen
    });

  return (
    <div
    {...getTrackProps({
      style: {
        height: '8px',
        background: '#f4e6d4',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,.6)',
        borderRadius: '2px',
      },
    })}
  >
    {handles.map(({ getHandleProps }) => (
      <div
        {...getHandleProps({
          style: {
            width: '24px',
            height: '24px',
            borderRadius: '100%',
            background: 'linear-gradient(to bottom, #f4e6d4 45%, #f4e6d4 55%)',
            border: 'solid 1px #888',
          },
        })}
      />
    ))}
  </div>
  );

};

export default Slider
