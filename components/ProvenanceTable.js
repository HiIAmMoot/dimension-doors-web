import React from 'react'
import { useState } from 'react';

const ProvenanceTable = ({_metas, _batch, _batchHashes, _closed}) => {

  const [batch, setBatch] = useState(_batch);


  var values;
  var provenanceBatches;
  if (_batch) {
      const currentBatch = _batchHashes.length;

      provenanceBatches = Array(currentBatch);
      values = Array(currentBatch);
      for (let i = 0; i < currentBatch; i++){
          provenanceBatches[i] = "";
      }

      for (let i = 0; i < _metas.length; i++) {
          const batch = _metas[i].attributes[_metas[i].attributes.length - 1].value;
          provenanceBatches[batch - 1] = provenanceBatches[batch - 1] + _metas[i].provenance;
      }



      if (_closed) {
        for (let i = 0; i < currentBatch; i++){
          values[i] = (<tr key={_batchHashes[i]} className="hover:bg-grey-lighter">
                          <td className="py-4 px-6 border-b border-grey-light text-textColor">{i + 1}</td>
                          <td className="py-4 px-6 border-b border-grey-light text-textColor table-cell md:hidden">
                                <textarea className="textarea bg-backgroundColor text-textColor border border-textColor px-1 py-1" rows={3} cols={5} disabled={true} value={_batchHashes[i]}/>
                          </td>
                          <td className="py-4 px-6 border-b border-grey-light text-textColor hidden md:table-cell">{_batchHashes[i]}</td>
                          <td className="py-4 px-6 border-b border-grey-light text-textColor table-cell md:hidden">
                                <textarea className="textarea bg-backgroundColor text-textColor border border-textColor px-1 py-1" rows={3} cols={5} disabled={true} value={provenanceBatches[i]}/>
                          </td>
                          <td className="py-4 px-6 border-b border-grey-light text-textColor hidden md:table-cell">
                                <textarea className="textarea bg-backgroundColor text-textColor border border-textColor px-1 py-1" rows={3} cols={50} disabled={true} value={provenanceBatches[i]}/>
                          </td>
                        </tr>)
        }
      } else {
        for (let i = 0; i < currentBatch; i++){
          values[i] = (<tr key={_batchHashes[i]} className="hover:bg-grey-lighter">
                          <td className="py-4 px-6 border-b border-grey-light text-textColor">{i + 1}</td>
                          <td className="py-4 px-6 border-b border-grey-light text-textColor table-cell md:hidden">
                                <textarea className="textarea bg-backgroundColor text-textColor border border-textColor px-1 py-1" rows={3} cols={5} disabled={true} value={_batchHashes[i]}/>
                          </td>
                          <td className="py-4 px-6 border-b border-grey-light text-textColor hidden md:table-cell">{_batchHashes[i]}</td>
                          <td className="py-4 px-6 border-b border-grey-light text-textColor table-cell md:hidden">
                                <textarea className="textarea bg-backgroundColor text-textColor border border-textColor px-1 py-1" rows={3} cols={5} disabled={true} value={provenanceBatches[i]}/>
                          </td>
                          <td className="py-4 px-6 border-b border-grey-light text-textColor hidden md:table-cell">
                                <textarea className="textarea bg-backgroundColor text-textColor border border-textColor px-1 py-1" rows={3} cols={50} disabled={true} value={provenanceBatches[i]}/>
                          </td>
                      </tr>)
        }
      }

  } else {
    values = Array(_metas.length);
    for (let i = 0; i < _metas.length; i++) {
      values[i] = (<tr key={_metas[i].provenance} className="hover:bg-grey-lighter">
                      <td className="py-4 px-6 border-b border-grey-light text-textColor">{_metas[i].token_id}</td>
                      <td className="py-4 px-6 border-b border-grey-light text-textColor">{_metas[i].name}</td>
                      <td className="py-4 px-6 border-b border-grey-light text-textColor table-cell md:hidden">
                                <textarea className="textarea bg-backgroundColor text-textColor border border-textColor px-1 py-1" rows={3} cols={5} disabled={true} value={_metas[i].provenance}/>
                          </td>
                      <td className="py-4 px-6 border-b border-grey-light text-textColor hidden md:table-cell">{_metas[i].provenance}</td>
                      <td className="py-4 px-6 border-b border-grey-light text-textColor">{_metas[i].attributes[_metas[i].attributes.length - 1].value}</td>
                      <td className="py-4 px-6 border-b border-grey-light text-textColor">
                        <a href={_metas[i].image} target="_blank" className="text-grey-lighter font-bold py-1 px-3 rounded text-xs bg-blue hover:bg-blue-dark">View</a>
                      </td>
                    </tr>)
      //console.log(values[i])
    }
  }




  const [expanded, setExpaned] = useState(false);
  
  function expand() {
      setExpaned(!expanded);
  }

  return (
  
    
  <div className="w-full mx-auto flex justify-center">
      <div className="bg-mainColor shadow-md rounded my-6">
        <table className="text-left w-full border-collapse">
          <thead>

              {batch ? (
                <tr> 
                    <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-textColor border-b border-grey-light">BATCH #</th>
                    <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-textColor border-b border-grey-light">SHA256 HASH</th>
                    <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-textColor border-b border-grey-light">CONCATENATED HASH</th>
                </tr>


              ) : (
                <tr>
                    <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-textColor border-b border-grey-light">TOKEN ID</th>
                    <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-textColor border-b border-grey-light">NAME</th>
                    <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-textColor border-b border-grey-light">SHA256 HASH</th>
                    <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-textColor border-b border-grey-light">BATCH #</th>
                    <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-textColor border-b border-grey-light">PREVIEW</th>
                </tr>
              )}


          </thead>
          <tbody>
          {values}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ProvenanceTable


