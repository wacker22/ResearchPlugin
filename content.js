const NOT_FOUND = -1;

class ToolTipIcon {
  constructor(toolTipElement, toolTipClass, toolTipText, gitHubElement) {
    this.toolTipElement = toolTipElement;
    this.toolTipClass = toolTipClass;
    this.toolTipText = toolTipText;
    this.gitHubElement = gitHubElement;
  }

  createIcon() {
    const toolTipContainer = document.createElement('div');
    toolTipContainer.className = this.toolTipClass;

    const circleIcon = document.createElement('span');
    circleIcon.className = 'helpIconCircle';
    circleIcon.innerHTML = '?';

    const toolTip = document.createElement('span');
    toolTip.className = 'helpIconText';
    toolTip.innerHTML = this.toolTipText;

    toolTipContainer.appendChild(circleIcon);
    toolTipContainer.appendChild(toolTip);

    this.toolTipElement = toolTipContainer;
  }
}

/**
 * Function name: checkURL
 * Checks the windows current URL for keywords to determine which tooltips
 * to display
 */
function checkURL() {
  // check if the user wants to edit a file that they are not an owner of
  if (checkIsEditingForkedFile()) {
    addForkToolTips();
  }
  // if the user is editing a markdown file
  else if (
    window.location.href.indexOf('.md') !== NOT_FOUND &&
    window.location.href.indexOf('edit') !== NOT_FOUND
  ) {
    addReadMeToolTips();
  }
  // if the user is reviewing a pull request
  else if (window.location.href.indexOf('compare') !== NOT_FOUND) {
    addProposeChangesToolTips();
  } else if (
    window.location.href.indexOf('pull') !== NOT_FOUND &&
    window.location.href.indexOf('pulls') === NOT_FOUND &&
    window.location.href.indexOf('quick_pull') === NOT_FOUND
  ) {
    addReviewPullRequestTips();
    // 
  }
  // if the user is opening a pull request
  else if (document.getElementsByClassName('h-card').length !== 0) {
    createProfileCard();
  }
  // if the user is creating a new issue
  else if (
    window.location.href.indexOf('issues') !== NOT_FOUND &&
    window.location.href.indexOf('new') !== NOT_FOUND
  ) {
    addReportIssueTips();
  } else if (
    window.location.href.indexOf('issues') !== NOT_FOUND &&
    window.location.href.indexOf('new') === NOT_FOUND
  ) {
    addReviewIssueTips();
  } else {
    // do nothing
  }
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse)
  {
    if(request.message === 'reload')
    {
      
        console.log("Reloading...");
        location.reload();
      
    }
  }
);

checkURL();




/**
 * Function name: checkIsEditingForkedFile
 * Checks if the user is viewing a file that they do not own
 */
function checkIsEditingForkedFile() {
  try {
    // check if there is a pencil icon with this aria label
    return (
      document.getElementsByClassName('tooltipped')[2].getAttribute('aria-label') ===
      'Edit the file in your fork of this project'
    );
  } catch (error) {
    return false;
  }
}

/**
 * Function name: addProgressBar
 * Adds progressBar above forms in GitHub pages to let user how far they are
 * in editing files
 * @param currentStep current step in process
 * @param totalSteps the amount of steps in process to determine overall progress
 * @param rootElement className of GitHub HTML element that the progress bar
 *                      will be added to
 */
function addProgressBar(currentStep, totalSteps, rootElement, stepsList) {
  // create the progress bar element
  const progressBarContainer = document.createElement('div');
  progressBarContainer.className = 'container';

  const progressBar = document.createElement('div');
  progressBar.className = 'progressbar';

  const itemList = document.createElement('ul');

  let index = 1;

  for (index = 1; index <= stepsList.length; index += 1) {
    const listItem = document.createElement('li');
    listItem.innerHTML = stepsList[index - 1];

    if (currentStep === totalSteps) {
      listItem.className = 'completed';
    } else if (index === currentStep) {
      listItem.className = 'partial';
    }
    // if the user has already completed a step
    else if (index < currentStep) {
      listItem.className = 'partial completed';
    }
    itemList.appendChild(listItem);
  }

  progressBar.appendChild(itemList);

  progressBarContainer.appendChild(progressBar);

  $(progressBarContainer).insertBefore(rootElement);

  if (isProcessCompleted()) {
    createSuccessRibbon();
  }
}

/**
 * Function name: isComplete
 * Checks if issue/ pull request was succesfully created and is open in the repo
 */
function isProcessCompleted() {
  let status = '';
  try {
    status = document.getElementsByClassName('State')[0].getAttribute('title');
  } catch (error) {
    return false;
  }
  return status === 'Status: Open';
}

/**
 * Function name: createSuccessRibbon
 * Creates ribbon above progress bar to inform the user that the process is successful
 */
function createSuccessRibbon() {
  let processType = '';

  if (window.location.href.indexOf('issues') != NOT_FOUND) {
    processType = 'issue';
  } else {
    processType = 'pull request';
  }

  const successRibbonContainer = document.createElement('div');
  successRibbonContainer.className = 'successRibbon';

  const ribbonMessage = document.createTextNode(
    `The ${processType}  was created successfully and will be reviewed shortly`
  );

  successRibbonContainer.appendChild(ribbonMessage);

  $(successRibbonContainer).insertBefore('.container');
}

/**
 * Function name: addReadMeToolTips
 * Adds tooltips to webpage when editing markdown files
 * First step in editing markdown files
 */
function addReadMeToolTips() {
  const steps = ['Edit File', 'Confirm Pull Request', 'Pull Request Opened'];

  // progress bar above editor
  addProgressBar(1, 3, '.js-blob-form', steps);

  // icon to right of file name input
  const fileNameChangeText =
    'This is the file name, changing it will create a new file with the new name';

  const breadCrumbDiv = '.d-md-inline-block';

  const fileNameChangeIcon = new ToolTipIcon('H4', 'helpIcon', fileNameChangeText, breadCrumbDiv);

  fileNameChangeIcon.createIcon();

  $(fileNameChangeIcon.toolTipElement).insertAfter(fileNameChangeIcon.gitHubElement);

  // banner above commit message input
  const commitTitleText =
    'This is the title. Give a brief description of the change. Be short and objective.';

  const inputTitleLabel = document.createElement('h3');
  inputTitleLabel.innerHTML = 'Insert a title here';
  inputTitleLabel.style.display = 'inline-block';
  inputTitleLabel.style.marginRight = '20px';

  $(inputTitleLabel).insertBefore('#commit-summary-input');

  const commitMessageIcon = new ToolTipIcon(
    'H4',
    'helpIcon',
    commitTitleText,
    '#commit-summary-input'
  );

  commitMessageIcon.createIcon();

  $(commitMessageIcon.toolTipElement).insertAfter('#commit-summary-input');

  const descriptionText =
    'Add a more detailed description if needed. Here you can present your arguments and reasoning that lead to change.';

  const inputDescriptionLabel = document.createElement('h3');
  inputDescriptionLabel.innerHTML = 'Insert a <br> description here';
  inputDescriptionLabel.style.display = 'inline-block';
  inputDescriptionLabel.style.marginRight = '22px';

  $(inputDescriptionLabel).insertBefore('#commit-description-textarea');

  const extendedDescIcon = new ToolTipIcon(
    'H4',
    'helpIcon',
    descriptionText,
    '#commit-description-textarea'
  );

  extendedDescIcon.createIcon();

  $(extendedDescIcon.toolTipElement).insertAfter(extendedDescIcon.gitHubElement);

  const commitChangesDirectlyText =
    'By clicking the Commit Changes button the changes will automatically be pushed to the repo';

  const submitChangesIcon = new ToolTipIcon(
    'H4',
    'helpIcon',
    commitChangesDirectlyText,
    '#submit-file'
  );

  submitChangesIcon.createIcon();

  submitChangesIcon.toolTipElement.style.marginRight = '20px';

  $(submitChangesIcon.toolTipElement).insertBefore(submitChangesIcon.gitHubElement);
}

// On pull request step 1, toggle icon text to help inform user
let onDirectPull = true;
let iconText = '';

const pullChangesText =
  'By clicking the Propose changes button you will start the submission process. You will have the chance to check your changes before finalizing it.';

$('input[name="commit-choice"]').click(() => {
  document.getElementsByClassName('helpIcon')[3].remove();

  if (onDirectPull) {
    iconText = pullChangesText;
    onDirectPull = false;
  } else {
    iconText =
      'By clicking the Commit Changes button the changes will be directly pushed to the repo';
    onDirectPull = true;
  }

  const submitChangesIcon = new ToolTipIcon('H4', 'helpIcon', iconText, '#submit-file');

  submitChangesIcon.createIcon();

  submitChangesIcon.toolTipElement.style.marginRight = '20px';

  $(submitChangesIcon.toolTipElement).insertBefore(submitChangesIcon.gitHubElement);
});

/**
 * Function name: addProposeChangesToolTips
 * Adds tooltips to webpage when confirming a change to file
 * Second step in editing markdown files
 */
function addProposeChangesToolTips() {
  const steps = ['Edit File', 'Create Pull Request', 'Pull Request Opened'];

  addProgressBar(2, 3, '.repository-content', steps);

  $('#pull_request_body').attr(
    'placeholder',
    'You can add a more detailed description here if needed.'
  );

  try {
    var branchName = document.getElementsByClassName('branch-name')[0].innerText;
  } catch {
    var isComparingBranch = true;
  }

  let newHeaderText = `Finish the pull request submission below to allow others to accept the changes. These changes can be viewed later under the branch name: ' +
    ${branchName}`;

  if (isComparingBranch) {
    newHeaderText =
      'Finish the pull request submission below to allow others to accept the changes';

    $('.gh-header-title').text('Create Pull Request');
  }

  $('.gh-header-meta').text(newHeaderText);

  let pullRequestTitle = document.getElementsByClassName('gh-header-title')[1];
  pullRequestTitle.innerHTML = 'Create pull request';

  const branchContainerText =
    'This represents the origin and destination of your changes if you are not sure, leave it how it is, this is common for small changes.';

  const topRibbon = document.getElementsByClassName('js-range-editor')[0];
  topRibbon.style.width = '93%';
  topRibbon.style.display = 'inline-block';

  // ribbon above current current branch and new pull request branch
  const currentBranchIcon = new ToolTipIcon(
    'H4',
    'helpIcon',
    branchContainerText,
    '.js-range-editor'
  );

  currentBranchIcon.createIcon();

  $(currentBranchIcon.toolTipElement).insertAfter(currentBranchIcon.gitHubElement);

  // move button row to left side of editor
  const buttonRow = document.getElementsByClassName('d-flex flex-justify-end m-2')[0];
  buttonRow.classList.remove('flex-justify-end');
  buttonRow.classList.add('flex-justify-start');

  const confirmPullRequestText =
    'By clicking this button you will create the pull request to allow others to view your changes and accept them into the repository.';

  const submitButtonClass = '.js-pull-request-button';

  // icon next to create pull request button
  const createPullRequestBtn = new ToolTipIcon(
    'H4',
    'helpIcon',
    confirmPullRequestText,
    submitButtonClass
  );

  createPullRequestBtn.createIcon();

  $(createPullRequestBtn.toolTipElement).insertAfter(createPullRequestBtn.gitHubElement);

  const summaryText =
    'This shows the amount of commits in the pull request, the amount of files you changed in the pull request, how many comments were on the commits for the pull request and the ammount of people who worked together on this pull request.';

  const summaryClass = '.overall-summary';

  // override the container width and display to add icon
  const numbersSummaryContainer = document.getElementsByClassName('overall-summary')[0];
  numbersSummaryContainer.style.width = '93%';
  numbersSummaryContainer.style.display = 'inline-block';

  // icon above summary of changes and commits
  const requestSummaryIcon = new ToolTipIcon('H4', 'helpIcon', summaryText, summaryClass);

  requestSummaryIcon.createIcon();

  requestSummaryIcon.toolTipElement.style = 'float:right;';

  $(requestSummaryIcon.toolTipElement).insertAfter(requestSummaryIcon.gitHubElement);

  const comparisonClass = '.details-collapse';

  const changesText =
    'This shows the changes between the orginal file and your version. Green(+) represents lines added. Red(-) represents removed lines';

  // icon above container for changes in current pull request
  const comparisonIcon = new ToolTipIcon('H4', 'helpIcon', changesText, comparisonClass);

  comparisonIcon.createIcon();

  const commitSummaryContainer = document.getElementsByClassName('details-collapse')[0];

  commitSummaryContainer.style.width = '93%';
  commitSummaryContainer.style.display = 'inline-block';

  $(comparisonIcon.toolTipElement).insertAfter(comparisonIcon.gitHubElement);
}

/**
 * Function name: addReviewPullRequestTips
 * Adds tooltips to webpage when reviewing pull requests
 * Third step in editing markdown files
 */
function addReviewPullRequestTips() {
  const steps = ['Edit File', 'Confirm Pull Request', 'Pull Request Opened'];

  addProgressBar(3, 3, '.gh-header-show', steps);

  const titleTest = 'new'; // document.getElementsByClassName('js-issue-title')[0];

  const branchContainerText =
    'This indicates that the pull request is open meaning someone will get to it soon.';

  const pullRequestStatusIcon = new ToolTipIcon(
    'H4',
    'helpIcon',
    branchContainerText,
    '.js-clipboard-copy'
  );

  pullRequestStatusIcon.createIcon();

  $(pullRequestStatusIcon.toolTipElement).insertAfter(pullRequestStatusIcon.gitHubElement);

  const requestButtonsText =
    'This will close the pull request meaning people cannot view this! Do not click close unless the request was solved.';

  const requestButtonsClass = '.js-comment-and-button';

  const closePullRequestIcon = new ToolTipIcon(
    'H4',
    'helpIcon',
    requestButtonsText,
    requestButtonsClass
  );

  closePullRequestIcon.createIcon();

  $(closePullRequestIcon.toolTipElement).insertBefore(closePullRequestIcon.gitHubElement);

  closePullRequestIcon.toolTipElement.style.marginRight = '20px';

  const reviewerText =
    "Assigned reviewers will recieve an email asking for a review. You'll be notified when they finish.";

  const reviewerClass = '.hx_rsm';
  
  const reviewerIcon = new ToolTipIcon(
    'H4',
    'helpIcon',
    reviewerText,
    reviewerClass,

  );

  reviewerIcon.createIcon();

  $(reviewerIcon.toolTipElement).insertBefore(document.getElementById("reviewers-select-menu"));

  const assigneesText =
    "Use this when you want to assign someone to take care of the pull request.";

  const assigneesClass = '.hx_rsm';
  
  const assigneeIcon = new ToolTipIcon(
    'H4',
    'helpIcon',
    assigneesText,
    assigneesClass,
  );

  assigneeIcon.createIcon();

  $(assigneeIcon.toolTipElement).insertBefore(document.getElementById("assignees-select-menu"));

  const labelsText =
    "Labels allow you to filter pull requests and stay organized if you have a lot of pull requests.";

  const labelsClass = '.hx_rsm';
  
  const labelsIcon = new ToolTipIcon(
    'H4',
    'helpIcon',
    labelsText,
    labelsClass,
  );

  labelsIcon.createIcon();

  $(labelsIcon.toolTipElement).insertBefore(document.getElementById("labels-select-menu"));

  const projectsText =
    "Associate this pull request with a github project. This helps the project track development.";

  const projectsClass = '.hx_rsm';
  
  const projectsIcon = new ToolTipIcon(
    'H4',
    'helpIcon',
    projectsText,
    projectsClass,
  );

  projectsIcon.createIcon();

  $(projectsIcon.toolTipElement).insertBefore(document.getElementById("projects-select-menu"));

  const milestoneText =
    "Repository milestones help track progress towards goals. Use this if this pull request contributes to a goal";

  const milestoneClass = '.hx_rsm';
  
  const milestoneIcon = new ToolTipIcon(
    'H4',
    'helpIcon',
    milestoneText,
    milestoneClass,
  );

  milestoneIcon.createIcon();

  $(milestoneIcon.toolTipElement).insertBefore(document.getElementById("milestone-select-menu"));

  const developmentText =
    "Use this to associate this pull request with issues. This helps to specify what the pull request accomplishes";

  const developmentClass = '.hx_rsm';
  
  const developmentIcon = new ToolTipIcon(
    'H4',
    'helpIcon',
    developmentText,
    developmentClass,
  );

  developmentIcon.createIcon();

  $(developmentIcon.toolTipElement).insertBefore(document.getElementById("reference-select-menu"));
  

  /*
  var submitButtons = document.getElementsByClassName('d-flex flex-justify-end')[0];
  submitButtons.classList.remove('flex-justify-end');
  submitButtons.classList.add('flex-justify-start');*/

  $('.js-quick-submit-alternative').click((event) => {
    if (!Confirm(`Are you sure that you want to close the pull request: ${titleTest}?`)) {
      event.preventDefault();
    }
  });
}

/**
 * Function name: addForkToolTips
 * Edits tooltips when viewing a repository that you are not a contributor of
 */
function addForkToolTips() {
  $('.tooltipped-nw:nth-child(2)').attr('aria-label', 'Edit Readme');
}

/**
 * Function name: addIssueTips
 * Adds tolltips to page when opening a new issue report
 */
function addReportIssueTips() {
  const steps = ['Report Issue', 'confirm Issue Report', 'Issue Submitted'];

  // progress bar above editor
  addProgressBar(1, 3, '.new_issue', steps);

  const submitButtonText = 'After clicking this, you will have a chance to update the issue report';

  const submitButtonClass = '.flex-justify-end button:eq(0)';

  const submitButtonIcon = new ToolTipIcon('H4', 'helpIcon', submitButtonText, submitButtonClass);

  submitButtonIcon.createIcon();

  $(submitButtonIcon.toolTipElement).insertAfter(submitButtonIcon.gitHubElement);
}

/**
 * Function name: addIssueTips
 * Adds tolltips to page when reviewing a new issue report
 */
function addReviewIssueTips() {
  const issueTitle = document.getElementsByClassName('js-issue-title')[0].innerText;

  const steps = ['Report Issue', 'confirm Issue Report', 'Issue Submitted'];

  addProgressBar(3, 3, '.repository-content', steps);

  const buttonRow = document.getElementsByClassName('d-flex flex-justify-end')[0];
  buttonRow.classList.remove('flex-justify-end');
  buttonRow.classList.add('flex-justify-start');

  const closeIssueIconText =
    'This will close the issue request meaning people cannot view this! Do not click close unless the request was solved. ';

  const submitButtonClass = '.flex-justify-end button:eq(0)';

  const submitButtonIcon = new ToolTipIcon('H4', 'helpIcon', closeIssueIconText, submitButtonClass);

  submitButtonIcon.createIcon();

  submitButtonIcon.toolTipElement.style.marginRight = '20px';

  $(submitButtonIcon.toolTipElement).insertBefore(submitButtonIcon.gitHubElement);

  $('.js-quick-submit-alternative').click(function (event) {
    if (!confirm(`Are you sure that you want to close the issue: ${issueTitle}?`)) {
      event.preventDefault();
    }
  });
}

/**
 * function getCommits
 * @param string username - GitHub username for API
 * Uses GitHub API to view commit totals for user
 */
async function getCommits(repositories, username) {
  const oAuthToken = '';

  let repoObject = {};
  let ctx = document.getElementById('repositories');
  let skillGraphContainer = document.getElementById('skillGraph');
  const barColors = [];

  const headers = {
    Authorization: 'Token ' + oAuthToken,
  };

  for (const repo of repositories) {
    const commitUrl = `https://api.github.com/repos/${username}/${repo}/commits?page=1&per_page=25`;

    const commitResponse = await fetch(commitUrl, {
      method: 'GET',
      headers: headers,
    });

    let commitResult = await commitResponse.json();
    repoObject[repo] = commitResult.length;

    barColors.push(getRandomColor());
  }

  const labels = Object.keys(repoObject);
  const data = Object.values(repoObject);

  labels.sort((a, b) => {
    return repoObject[b] - repoObject[a];
  });

  data.sort((a, b) => {
    return b - a;
  });

  myBarChart = new Chart(skillGraphContainer, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Commits',
          backgroundColor: barColors,
          data: data,
        },
      ],
    },
    options: {
      responsive: false,
      legend: { display: false },
      title: {
        display: true,
        text: `Commits per repository for:  ${username}`,
      },
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
              max: 30,
              stepSize: 1,
            },
          },
        ],
        xAxes: [
          {
            ticks: {
              fontSize: 8,
              callback: function (value) {
                if (value.length > 4) {
                  return value.substr(0, 4) + '...'; //truncate
                } else {
                  return value;
                }
              },
            },
          },
        ],
      },
      animation: {
        duration: 1,
        onProgress: function () {
          var chartInstance = this.chart,
            ctx = chartInstance.ctx;

          ctx.font = Chart.helpers.fontString(
            Chart.defaults.global.defaultFontSize,
            Chart.defaults.global.defaultFontStyle,
            Chart.defaults.global.defaultFontFamily
          );
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';

          this.data.datasets.forEach(function (dataset, i) {
            var meta = chartInstance.controller.getDatasetMeta(i);
            meta.data.forEach(function (bar, index) {
              if (dataset.data[index] > 0) {
                var data = dataset.data[index];
                ctx.fillText(data, bar._model.x, bar._model.y);
              }
            });
          });
        },
      },
    },
  });
}

/**
 * function getRepos
 * @param string username - GitHub username for API
 * Uses GitHub API to view programming languages for user
 */
async function getRepos(username) {
  const oAuthToken = '';

  const url = `https://api.github.com/users/${username}/repos`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Token ${oAuthToken}`,
    },
  });

  const result = await response.json();

  const languages = [];
  const repositoryNames = [];
  let labels = {};
  let dataSet = {};
  const barColors = [];
  result.forEach((index) => {
    if (index.language != null) {
      languages.push(index.language);
      repositoryNames.push(index.name);

      barColors.push(getRandomColor());
    }
  });

  getCommits(repositoryNames, username);

  const repoGraphContainer = document.getElementById('myChart');

  const repositoriesObject = {};

  for (let index = 0; index < languages.length; index += 1) {
    if (!repositoriesObject[languages[index]]) {
      repositoriesObject[languages[index]] = 0;
    }
    repositoriesObject[languages[index]] += 1;
  }

  labels = Object.keys(repositoriesObject);
  dataSet = Object.values(repositoriesObject);

  // use b - a for desc order and a - b for asc order
  labels.sort((a, b) => {
    return repositoriesObject[b] - repositoriesObject[a];
  });

  dataSet.sort((a, b) => {
    return b - a;
  });

  myBarChart = new Chart(repoGraphContainer, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Repositories',
          backgroundColor: barColors,
          data: dataSet,
        },
      ],
    },
    options: {
      responsive: false,
      legend: { display: false },
      title: {
        display: true,
        text: `Programming languge totals for ${username}'s repositories`,
      },
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
              stepSize: 1,
            },
          },
        ],
      },
      animation: {
        duration: 1,
        onProgress: function () {
          var chartInstance = this.chart,
            ctx = chartInstance.ctx;

          ctx.font = Chart.helpers.fontString(
            Chart.defaults.global.defaultFontSize,
            Chart.defaults.global.defaultFontStyle,
            Chart.defaults.global.defaultFontFamily
          );
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';

          this.data.datasets.forEach(function (dataset, i) {
            var meta = chartInstance.controller.getDatasetMeta(i);
            meta.data.forEach(function (bar, index) {
              if (dataset.data[index] > 0) {
                var data = dataset.data[index];
                ctx.fillText(data, bar._model.x, bar._model.y);
              }
            });
          });
        },
      },
    },
  });
}

/**
 * Function: createCardContainer
 * Creates structure of profile overview
 */
function createCardContainer() {
  const outerContainer = document.getElementsByClassName('graph-before-activity-overview')[0];

  outerContainer.className += ' card-container';

  const cardBack = document.createElement('div');
  cardBack.className = 'back';

  const repoGraph = document.createElement('canvas');
  repoGraph.className = 'graph';
  repoGraph.style.borderRight = '1px solid black';
  repoGraph.style.borderBottom = '1px solid black';
  repoGraph.style.float = 'left';
  repoGraph.id = 'myChart';

  const skillGraph = document.createElement('canvas');
  skillGraph.className = 'graph';
  skillGraph.style.borderBottom = '1px solid black';
  skillGraph.id = 'skillGraph';
  skillGraph.style.float = 'right';

  const commitsGraph = document.createElement('canvas');
  commitsGraph.className = 'graph';
  commitsGraph.style.borderRight = '1px solid black';
  commitsGraph.style.float = 'left';
  commitsGraph.id = 'commitsGraph';

  const languagesGraph = document.createElement('canvas');
  languagesGraph.className = 'graph';
  languagesGraph.id = 'languagesGraph';
  languagesGraph.style.float = 'right';

  cardBack.appendChild(repoGraph);
  cardBack.appendChild(skillGraph);
  cardBack.appendChild(commitsGraph);
  cardBack.appendChild(languagesGraph);

  outerContainer.appendChild(cardBack);
}

/**
 * Function name: createProfileCard
 * Creates a 2x2 grid behind contribution graph on profile page with graphs
 */
function createProfileCard() {
  const profileCardIconText = 'Click this tooltip to show more info about the user';
  const contributionGraphClass = '.js-calendar-graph';

  const showGraphIcon = new ToolTipIcon(
    'H4',
    'helpIcon graph-tooltip',
    profileCardIconText,
    contributionGraphClass
  );

  const username = document.getElementsByClassName('vcard-username')[0].innerHTML;

  createCardContainer();

  getRepos(username);

  getApis(username);

  showGraphIcon.createIcon();

  $(showGraphIcon.toolTipElement).insertBefore(showGraphIcon.gitHubElement);

  $('.helpIcon').click(() => {
    if ($('.helpIconCircle').text() === '?') {
      $('.helpIconCircle').text('X');
      $('.helpIconText').addClass('removeText');
    } else {
      $('.helpIconCircle').text('?');
      $('.helpIconText').removeClass('removeText');
    }
    $('.back').toggleClass('hovered');
    $('#js-contribution-activity').toggleClass('hidden');
    $('#user-activity-overview').toggleClass('hidden');
  });
}

function getApis(username) {
  const url = chrome.runtime.getURL('result.json');

  fetch(url)
    .then((response) => response.json()) // assuming file contains json
    .then((json) => createApiGraph(json, username));
}

const colors = [
  '#3e95cd',
  '#8e5ea2',
  '#3cba9f',
  '#e8c3b9',
  '#c45850',
  '#3e95cd',
  '#8e5ea2',
  '#3cba9f',
  '#e8c3b9',
  '#c45850',
  '#3e95cd',
  '#8e5ea2',
  '#3cba9f',
  '#e8c3b9',
  '#c45850',
];

function manageProgressBar() {
  $('.progressbar').toggleClass('hiddenDisplay');
}

function manageIcons() {
  $('.helpIcon').toggleClass('hiddenDisplay');

  /* 
  chrome.storage.local.get('iconStatus', function(status) {
      let iconStatus = status.iconStatus;

      if(iconStatus) {
          document.getElementById('iconBtn').checked = true;
      } else {
          document.getElementById('iconBtn').checked = false;
      }
  });
*/
}

function manageRibbon() {
  $('.successRibbon').toggleClass('hiddenDisplay');
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'progress_bar') {
    manageProgressBar();
  } else if (request.message === 'icon') {
    manageIcons();
  } else if (request.message === 'ribbon') {
    manageRibbon();
  }
});

/**
 * Function name: createApiGraph
 * @param {JSON} userData
 * creates graph on user profile card about langauges and apis
 */
function createApiGraph(userData, username) {
  const apiGraphContainer = document.getElementById('commitsGraph');

  const apis = [];
  const apiTotals = [];

  const languages = [];

  let total = 0;

  userData.Repos.forEach((index) => {
    index.API.apis.forEach((api) => {
      if (total < 10) {
        apis.push(api.name);
        apiTotals.push(api.count);
        total += 1;
      }
    });

    index.API.langs.forEach((language) => {
      languages.push(language);
    });
  });

  myBarChart = new Chart(apiGraphContainer, {
    type: 'bar',
    data: {
      labels: apis,
      datasets: [
        {
          label: 'Total: ',
          backgroundColor: colors,
          data: apiTotals,
        },
      ],
    },
    options: {
      responsive: false,
      legend: { display: false },
      title: {
        display: true,
        text: `Api Totals for ${username}`,
      },
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
              stepSize: 1,
            },
          },
        ],
        xAxes: [
          {
            ticks: {
              fontSize: 8,
              callback: function (value) {
                if (value.length > 4) {
                  return value.substr(0, 4) + '...'; //truncate
                } else {
                  return value;
                }
              },
            },
          },
        ],
      },
      animation: {
        duration: 1,
        onProgress: function () {
          var chartInstance = this.chart,
            ctx = chartInstance.ctx;

          ctx.font = Chart.helpers.fontString(
            Chart.defaults.global.defaultFontSize,
            Chart.defaults.global.defaultFontStyle,
            Chart.defaults.global.defaultFontFamily
          );
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';

          this.data.datasets.forEach(function (dataset, i) {
            var meta = chartInstance.controller.getDatasetMeta(i);
            meta.data.forEach(function (bar, index) {
              if (dataset.data[index] > 0) {
                var data = dataset.data[index];
                ctx.fillText(data, bar._model.x, bar._model.y);
              }
            });
          });
        },
      },
    },
  });
}

function getRandomColor() {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
