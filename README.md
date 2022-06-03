# K8s Base Template

Project Base Template for Kubernetes-based Projects

## Getting started

To make it easy for you to get started with this template, here's a list of recommended next steps.

Already a pro? Just edit this README.md and make it your own.

## Where do you find what?

- `.gitlab-ci.yaml`: The deployment pipeline composed of `prepare`, `build` and `deployment` stages.
- `deploy/`: K8s manifest files that deploy an nginx server and a self-hosted Hello World Flask App.
- `hello/`: A simple Hello World Python App (Flask-based). Take this as a base camp for own projects.

## Deploy

Just start a new [deployment pipeline](../../../-/pipelines/new) to deploy

- the example `hello` service and 
- a default `nginx` HTTP service.

The pipeline is already prepared for automatic deployments. Feel free to adapt it according to your needs.

## Configure `kubectl` or `Lens`

You find your `KUBECONFIG` in Gitlab under Settings -> [VARIABLES](../../../-/settings/ci_cd).
Copy it and import it into [Lens](https://k8slens.dev) or set it as an environment variable on your local system.

You have then access to your connected Kubernetes namespace via `kubectl` or the Lens IDE.

```bash
kubectl get svc
# Should return nginx and hello service
```

```bash
kubectl get pod
# Should return 3 nginx pods and one hello pod
```

You can forward service ports to your local system using `kubectl port-forward`

```bash
kubectl port-forward svc/hello 8080:80
```

You can than access the hello service on 

- [http://localhost:8080](http://localhost:8080)
- or [http://localhost:8080/greet/es](http://localhost:8080/greet/es)

```bash
kubectl port-forward svc/nginx 8181:80
```

- Access the nginx HTTP server via [http://localhost:8181](http://localhost:8181)

You can also use the port-forwarding features from the Lens-UI.

## Adapt

You are now ready to use this repo as a base camp for your project.

Code strong!
