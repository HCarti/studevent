import React from 'react'
import './DashLiquidation.css';

const DashLiquidation = () => {
  return (
    <div className="liquidation-box">
      <h1>Liquidations</h1>
      <div className='inner-box' > 
        <div className="liq-left">
        Today
        </div>
        <div className="liq-right">
      List Of Submitted Liquidations
        </div>
      </div>
    </div>
  )
}

export default DashLiquidation