import React, { Component } from 'react';

import Loading from './Loading';
import AreaSelector from './AreaSelector';
import FileCard from './FileCard';
import { fileName } from './Mapper';
import { styledLog, startCounter, endCounter } from './Utilities';
import * as Log from './constants/log';
import { storageRef } from './constants/firebase';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

class Grid extends Component {
  constructor(props) {
    super(props);
    this.filesToShow = [];

    this.state = {
      _isFetch: false,
      files: []
    }
  }

  componentDidMount() {
    this.fetchFiles("/");
  }

  fetchFiles = path => {
    startCounter();
    console.log('');
    styledLog(Log.REQUEST + 'Fetching Files from ' + path + ' ...');

    const listRef = storageRef.child(path);

    return listRef.listAll().then(res => {
      res.prefixes.forEach(folderRef => {
        this.setState(state => {
          state.files.push({
            key: folderRef.location.path + "/",
            metadata: {
              _isFile: false,
              name: fileName(folderRef.location.path + "/"),
            }
          });
          return state;
        });
      });
      styledLog(Log.SUCCESS + 'Fetch with no metadata complete' + endCounter());
      if (this.state.files.length === 0) styledLog(Log.INFO + 'No folders found');

      res.items.forEach(itemRef => {
        this.fetchFilesMetadata(itemRef).then(item => {
          this.setState(state => {
            state.files.push(item);
            return state;
          })
        });
      });
      this.setState(state => {
        state._isFetch = true;
        return state;
      });
    }).catch(function(error) {
      console.log(error);
      return false;
    });
  }

  fetchFilesMetadata = itemRef => {
    startCounter();
    return itemRef.getMetadata().then(metadata => {
      styledLog(Log.SUCCESS + 'Metadata fetched for ' + metadata.name + endCounter());
      return {
        key: itemRef.location.path,
        metadata: {
          _isFile: true,
          name: metadata.name,
          size: metadata.size,
          timeCreated: metadata.timeCreated,
          updated: metadata.updated,
          fullPath: metadata.fullPath,
          contentType: metadata.contentType
        }
      }
    }).catch(error => {
      console.log(error);
      return false;
    });
  }

  handleShowFileCards = () => {
    if (this.state.files === null || this.state.files.length < 0) return (
      <span className="text-info mt-3">
        {
          this.state._isFetch
          ? "No files"
          : false
        }
      </span>
    );

    let fileCards = [];

    this.state.files.forEach(file => {
      fileCards.push(
        <FileCard
          key={file.key}
          file={file}
          customOnClick={e => {this.handleOpenFolder(file.key)}}
        />
      );
    });
    return fileCards;
  }

  handleOpenFolder = path => {
    if (!path.includes("/")) return false;

    this.setState(state => {
      state.files = [];
      return state;
    });
    this.fetchFiles(path);
  }

  render() {
    return (
      <div id="fileManager">
        <Loading _isFetch={this.state._isFetch}/>
        <AreaSelector />
        <Container>
          <Row className="justify-content-md-center fadeIn">
            {this.handleShowFileCards()}
          </Row>
        </Container>
      </div>
    );
  }
}

export default Grid;
