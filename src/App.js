import React, { Component } from 'react';
import ReactTable from 'react-table';
import './App.css';
import 'react-table/react-table.css';
import Axios from 'axios';
import moment from 'moment';
import _ from 'lodash';
import 'bootstrap/dist/css/bootstrap.css';
import Notifications, {notify} from 'react-notify-toast';

class App extends Component {
  constructor(props)
  {
    super(props)
    this.state = {
      data: []
    }
    this.locatesGetUrl = 'https://app.rhinofleettracking.com/rftapi/interview/locates';
    this.locatesPostUrl = 'https://app.rhinofleettracking.com/rftapi/interview/updateAlias'

  }

  componentDidMount()
  {
    this.getRecords(this.locatesGetUrl)
  };

  getRecords = (url) => {
    var responseData = [];

    Axios.get(url)
    .then(response => {
      responseData = _.uniqBy(response.data.results, e=>e.numVehicleDeviceID && e.numLongitude && e.numLatitude && e.dtDate),
      responseData.map(function(obj) {
        for(var key in obj) {
          if (obj[key] === null) {
            obj[key] = '-';
          }
        }
      }),
      this.setState({ data: responseData })
    })
    .catch(function(error){
      alert(error)
    })
  }

  handleInputChange = (cellInfo, event) => {
    let data = [...this.state.data];
    let dataInfo = data[cellInfo.index];

    if(dataInfo.txtAlias !== '' && dataInfo.txtAlias != event.target.value)
    {
    data[cellInfo.index][cellInfo.column.id] = event.target.value;

    this.setState({ data });


      Axios({ method: 'post', url:this.locatesPostUrl, data: {"numVehicleDeviceID" : dataInfo.numVehicleDeviceID,
      "txtAlias" : dataInfo.txtAlias}
      })
      .then( response => {
        notify.show('Successfully Saved Record', "success", 1000);
        this.getRecords(this.locatesGetUrl)
      })
      .catch(function(error){
        alert(error)
      })
    }

  };

  renderEditable = cellInfo => {
    const cellValue = this.state.data[cellInfo.index][cellInfo.column.id];

    return (
      <input
        placeholder="type here"
        name="input"
        type="text"
        onBlur={this.handleInputChange.bind(null, cellInfo)}
        defaultValue={cellValue}
      />
    );
  };

  render() {
    const { data } = this.state;
    return (
      <div className="App">
        <div className="App-header">
          <h2>Rhino Fleet Tracking Dev Test</h2>
        </div>

        <Notifications></Notifications>
        
        <ReactTable
          data={data}
          columns={[
            {
              Header: 'Alias',
              accessor: 'txtAlias',
              filterable: true,
              Cell: this.renderEditable
            },
            {
              Header: 'Address',
              id: 'address',
              accessor: d => d.txtAddress1 + '\n' + d.txtCity + ' ' + d.txtState + ' ' + d.txtZip,
              style: { 'overflow': 'visible', 'whiteSpace': 'normal' },
              filterable: true
            },
            {
              Header: 'Date',
              id: 'date',
              accessor: d=> {
                return moment(d.dtDate)
                .local()
                .format('YYYY-DD-MM')
              },
              filterable: false
            },
            {
              Header: 'Time',
              id: 'time',
              accessor: d => {
                return moment(d.dtDate)
                .format('LT')
              },
              filterable: false
            },
            {
              Header: 'Speed',
              accessor: 'numSpeed',
              filterable: false
            }
          ]}
          defaultPageSize={10}
          multiSort={true}
          className="-striped -highlight"
        >
        </ReactTable>
      </div>
    );
  }
}

export default App;
