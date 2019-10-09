import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../services/api';
import {
  Loading,
  Owner,
  IssueList,
  PageButtons,
  Button,
  StateButtons,
} from './styles';
import Container from '../../components/Container';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: 1,
    buttonDisabled: 1,
    page: 1,
    state: 'open',
  };

  async componentDidMount() {
    const { match } = this.props;

    const repoName = decodeURIComponent(match.params.repository);

    // const response = await api.get(`/repos/${repoName}`);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: 'open',
          per_page: 5,
          page: 1,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: 0,
    });
  }

  // componentDidUpdate(_, prevState) {}

  handlePageButtonClick = async numberPage => {
    const { page, repository, state } = this.state;
    const newPage = page + numberPage;
    const issues = await api.get(`/repos/${repository.full_name}/issues`, {
      params: {
        state,
        per_page: 5,
        page: newPage,
      },
    });
    const buttonDisabled = newPage > 1 ? 0 : 1;

    this.setState({ issues: issues.data, page: newPage, buttonDisabled });
  };

  handleStateButtonClick = async state => {
    const { repository } = this.state;

    const issues = await api.get(`/repos/${repository.full_name}/issues`, {
      params: {
        state,
        per_page: 5,
        page: 1,
      },
    });
    this.setState({
      issues: issues.data,
      page: 1,
      buttonDisabled: 1,
      state,
    });
  };

  render() {
    const {
      repository,
      issues,
      loading,
      buttonDisabled,
      page,
      state,
    } = this.state;
    if (loading) {
      return <Loading>Carregando</Loading>;
    }
    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>
        <StateButtons>
          <Button
            disabled={state === 'open'}
            onClick={() => this.handleStateButtonClick('open')}
          >
            Open
          </Button>
          <Button
            disabled={state === 'closed'}
            onClick={() => this.handleStateButtonClick('closed')}
          >
            Closed
          </Button>
          <Button
            disabled={state === 'all'}
            onClick={() => this.handleStateButtonClick('all')}
          >
            All
          </Button>
        </StateButtons>
        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
        <PageButtons>
          <Button
            disabled={buttonDisabled}
            onClick={() => this.handlePageButtonClick(-1)}
          >
            Anterior
          </Button>
          <span>Page : {page}</span>
          <Button onClick={() => this.handlePageButtonClick(1)}>Próximo</Button>
        </PageButtons>
      </Container>
    );
  }
}
