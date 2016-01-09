import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import MarkdownPreview from 'browser/components/MarkdownPreview'
import CodeEditor from 'browser/components/CodeEditor'

export const PREVIEW_MODE = 'PREVIEW_MODE'
export const EDIT_MODE = 'EDIT_MODE'

export default class ArticleEditor extends React.Component {
  constructor (props) {
    super(props)
    this.isMouseDown = false
    this.state = {
      status: PREVIEW_MODE,
      cursorPosition: null,
      firstVisibleRow: null
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.article.key !== this.props.article.key) {
      this.setState({
        content: this.props.article.content
      })
    }
  }

  resetCursorPosition () {
    this.setState({
      cursorPosition: null,
      firstVisibleRow: null
    }, function () {
      let previewEl = ReactDOM.findDOMNode(this.refs.preview)
      if (previewEl) previewEl.scrollTop = 0
    })
  }

  switchPreviewMode () {
    let cursorPosition = this.refs.editor.getCursorPosition()
    let firstVisibleRow = this.refs.editor.getFirstVisibleRow()
    this.setState({
      status: PREVIEW_MODE,
      cursorPosition,
      firstVisibleRow
    }, function () {
      let previewEl = ReactDOM.findDOMNode(this.refs.preview)
      let anchors = previewEl.querySelectorAll('.lineAnchor')
      for (let i = 0; i < anchors.length; i++) {
        if (parseInt(anchors[i].dataset.key, 10) > cursorPosition.row || i === anchors.length - 1) {
          var targetAnchor = anchors[i > 0 ? i - 1 : 0]
          previewEl.scrollTop = targetAnchor.offsetTop - 100
          break
        }
      }
    })
  }

  switchEditMode () {
    this.setState({
      status: EDIT_MODE
    }, function () {
      if (this.state.cursorPosition != null) {
        this.refs.editor.moveCursorTo(this.state.cursorPosition.row, this.state.cursorPosition.column)
        this.refs.editor.scrollToLine(this.state.firstVisibleRow)
      }
      this.refs.editor.editor.focus()
    })
  }

  handlePreviewMouseDown (e) {
    if (e.button === 2) return true
    this.isDrag = false
    this.isMouseDown = true
  }

  handlePreviewMouseMove () {
    if (this.isMouseDown) this.isDrag = true
  }

  handlePreviewMouseUp () {
    this.isMouseDown = false
    if (!this.isDrag) {
      this.switchEditMode()
    }
  }

  handleBlurCodeEditor () {
    let { article } = this.props
    if (article.mode === 'markdown') {
      this.switchPreviewMode()
    }
  }

  handleCodeEditorChange (value) {
    this.props.onChange(value)
  }

  render () {
    let { article } = this.props
    let showPreview = article.mode === 'markdown' && this.state.status === PREVIEW_MODE
    if (showPreview) {
      return (
        <div className='ArticleEditor'>
          <MarkdownPreview
            ref='preview'
            onMouseUp={e => this.handlePreviewMouseUp(e)}
            onMouseDown={e => this.handlePreviewMouseDown(e)}
            onMouseMove={e => this.handlePreviewMouseMove(e)}
            content={article.content}
          />
          <div className='ArticleDetail-panel-content-tooltip'>Click to Edit</div>
        </div>
      )
    }

    return (
      <div className='ArticleEditor'>
        <CodeEditor
          ref='editor'
          onBlur={e => this.handleBlurCodeEditor(e)}
          onChange={value => this.handleCodeEditorChange(value)}
          article={article}
        />
        {article.mode === 'markdown'
          ? (
            <div className='ArticleDetail-panel-content-tooltip'>Press ESC to watch Preview</div>
          )
          : null
        }
      </div>
    )
  }
}

ArticleEditor.propTypes = {
  article: PropTypes.shape({
    content: PropTypes.string,
    key: PropTypes.string,
    mode: PropTypes.string
  }),
  onChange: PropTypes.func
}