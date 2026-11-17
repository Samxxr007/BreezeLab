import React from 'react';
import { Link } from 'react-router-dom';
import { useSimulation } from '../state/simulationStore';
import { SimulationCanvas } from '../components/simulation/SimulationCanvas';
import { loadSavedScenarios } from '../state/persistence';
import { Wind, Layers3, Activity, Gauge, ArrowUpRight, Play, Orbit, Waves, FlaskConical, ChartNoAxesCombined } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Line, ComposedChart } from 'recharts';

const Metric = ({label,value,unit,icon:Icon,tone,foot}:{label:string;value:string;unit:string;icon:React.ElementType;tone:string;foot:string}) => (
  <div className="metric-card reveal">
    <div className="flex items-center justify-between"><span className="eyebrow">{label}</span><span className={`metric-icon ${tone}`}><Icon size={17}/></span></div>
    <div className="metric-value">{value}<span>{unit}</span></div><p className="metric-foot">{foot}</p>
  </div>
);

export const OverviewPage: React.FC = () => {
  const { state, startSimulation } = useSimulation();
  const scenarios = loadSavedScenarios();
  const latest = state.history[state.history.length - 1] || { maxConc:0,totalMass:0,avgConc:0 };
  const chartData = state.history.map((h:any)=>({...h, time:Number(h.t.toFixed(1))}));
  return <div className="page-shell">
    <section className="hero-panel reveal">
      <div className="hero-copy">
        <div className="status-kicker"><span className="pulse-dot"/> ENVIRONMENTAL INTELLIGENCE <span className="kicker-line"/></div>
        <h1>Understand the air.<br/><em>Model what moves.</em></h1>
        <p>A computational workspace for exploring pollutant transport, spatial concentration fields and the mathematics behind atmospheric dispersion.</p>
        <div className="flex flex-wrap gap-3 mt-7">
          <Link to="/simulation" className="btn-primary"><Play size={15} fill="currentColor"/> Open simulation <ArrowUpRight size={15}/></Link>
          <Link to="/analysis" className="btn-quiet">Explore vector fields <ArrowUpRight size={15}/></Link>
        </div>
      </div>
      <div className="hero-orbit" aria-hidden="true"><div className="orbit-ring ring-a"/><div className="orbit-ring ring-b"/><div className="orbit-core"><Wind size={38}/></div><span className="orbit-label label-a">ADVECTION</span><span className="orbit-label label-b">DIFFUSION</span><span className="orbit-label label-c">∇C</span></div>
      <div className="hero-index">01 <span>/</span> 07</div>
    </section>

    <div className="section-heading reveal"><div><span className="eyebrow">LIVE WORKSPACE</span><h2>Simulation overview</h2></div><div className="live-chip"><span className="pulse-dot"/> MODEL STATE</div></div>
    <section className="metric-grid">
      <Metric label="Simulation time" value={state.t.toFixed(1)} unit="s" icon={Activity} tone="teal" foot={`Configured duration ${state.params.duration}s`}/>
      <Metric label="Wind velocity" value={state.params.wind.speed.toFixed(2)} unit="m/s" icon={Wind} tone="blue" foot={`Direction ${state.params.wind.directionDeg.toFixed(0)}°`}/>
      <Metric label="Emission sources" value={String(state.params.sources.length)} unit="" icon={Layers3} tone="violet" foot="Active model emitters"/>
      <Metric label="Peak concentration" value={latest.maxConc.toFixed(2)} unit="µg/m²" icon={Gauge} tone="orange" foot="Maximum grid-cell density"/>
      <Metric label="Integrated quantity" value={latest.totalMass.toFixed(1)} unit="µg" icon={Waves} tone="green" foot="∬ C dA across domain"/>
    </section>

    <section className="feature-grid">
      <div className="viz-card viz-main reveal">
        <div className="card-heading"><div><span className="eyebrow">SPATIAL FIELD / 2D</span><h3>Pollutant dispersion map</h3><p>Numerically computed concentration distribution</p></div><Link to="/simulation" className="text-link">Open workspace <ArrowUpRight size={14}/></Link></div>
        <div className="canvas-frame"><SimulationCanvas interactive={false}/><div className="canvas-caption"><span><i className="legend-dot low"/> LOW</span><span><i className="legend-dot mid"/> MODERATE</span><span><i className="legend-dot high"/> HIGH</span><span className="ml-auto">MODEL CONCENTRATION · µg/m²</span></div></div>
      </div>
      <div className="viz-card reveal">
        <div className="card-heading"><div><span className="eyebrow">TEMPORAL RESPONSE</span><h3>Concentration trend</h3><p>Peak and average density over time</p></div><span className="mini-tag">LIVE DATA</span></div>
        <div className="chart-wrap">{chartData.length>1?<ResponsiveContainer width="100%" height="100%"><ComposedChart data={chartData} margin={{top:12,right:8,left:-18,bottom:0}}><defs><linearGradient id="peakFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#16877A" stopOpacity={.24}/><stop offset="100%" stopColor="#16877A" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#e7eeea" strokeDasharray="3 5" vertical={false}/><XAxis dataKey="time" tick={{fontSize:10,fill:'#71827b'}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:10,fill:'#71827b'}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{border:'1px solid #dce7e1',borderRadius:12,fontSize:11}}/><Area type="monotone" dataKey="maxConc" name="Peak concentration" stroke="#16877A" fill="url(#peakFill)" strokeWidth={2.5}/><Line type="monotone" dataKey="avgConc" name="Average concentration" stroke="#E69A3A" dot={false} strokeWidth={2}/></ComposedChart></ResponsiveContainer>:<div className="chart-empty"><ChartNoAxesCombined size={28}/><strong>No time-series yet</strong><span>Run a simulation to populate the chart.</span><button onClick={startSimulation} className="btn-primary mt-2"><Play size={13}/> Run model</button></div>}</div>
        <div className="chart-legend"><span><i className="legend-line teal-line"/> Peak concentration</span><span><i className="legend-line amber-line"/> Average concentration</span></div>
      </div>
    </section>

    <section className="bottom-grid">
      <div className="viz-card reveal"><div className="card-heading"><div><span className="eyebrow">WORKFLOW</span><h3>Explore the model</h3></div></div><div className="workflow-list"><Link to="/simulation"><span className="workflow-icon"><Orbit/></span><span><b>Dispersion simulation</b><small>Configure wind, diffusion and emission sources</small></span><ArrowUpRight size={16}/></Link><Link to="/analysis"><span className="workflow-icon"><Waves/></span><span><b>Vector calculus lab</b><small>Inspect gradient, divergence and curl fields</small></span><ArrowUpRight size={16}/></Link><Link to="/reports"><span className="workflow-icon"><ChartNoAxesCombined/></span><span><b>Analysis & reporting</b><small>Compare runs and export computed results</small></span><ArrowUpRight size={16}/></Link></div></div>
      <div className="viz-card reveal"><div className="card-heading"><div><span className="eyebrow">LOCAL LIBRARY</span><h3>Saved scenarios</h3><p>{scenarios.length} configurations available</p></div><Link to="/scenarios" className="text-link">View all <ArrowUpRight size={14}/></Link></div>{scenarios.length?<div className="scenario-list">{scenarios.slice(0,3).map(s=><div className="scenario-row" key={s.id}><span className="scenario-mark"><FlaskConical size={15}/></span><span><b>{s.name}</b><small>{s.params.wind.speed} m/s wind · {s.params.sources.length} sources</small></span><span className="scenario-arrow">↗</span></div>)}</div>:<div className="empty-library"><Layers3 size={24}/><span>No saved scenarios yet</span><Link to="/simulation">Create your first model <ArrowUpRight size={13}/></Link></div>}</div>
    </section>
    <footer className="page-footer"><span>BREEZELAB / ENVIRONMENTAL MODELLING WORKSTATION</span><span>VECTOR CALCULUS · ADVECTION–DIFFUSION PDE</span></footer>
  </div>;
};
