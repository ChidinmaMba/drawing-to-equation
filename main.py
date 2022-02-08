import numpy as np
from numpy import random  #it will be useful for generating some random noise (on purpose) in the data points that we want to fit
import matplotlib.pyplot as plt  #for plotting the data
from sklearn.metrics import r2_score
import os
import json
from flask import Flask
from flask_cors import CORS

def getEquation(x, y, degree): #x, y are lists doubles, degree = int
	x = np.array(x)
	y = np.array(y)
	fit = np.polyfit(x, y, degree)

	fit_equation = np.zeros(len(x))
	fit_equation_str = ""
	for i in range(degree + 1):
		fit_equation += fit[i]*np.power(x, degree-i)
		if(i != degree):
			fit_equation_str += str(round(fit[i], 2)) + "x^" + str(degree-i)
		else:	fit_equation_str += str(round(fit[i], 2))

		if(i != degree):
			fit_equation_str += " +"

	fit_json = fit.tolist()
	fit_equation_json = fit_equation.tolist()
	x_json = x.tolist()
	return {'fit': fit_json, 'fit_eq': fit_equation_str}


app = Flask(__name__)
CORS(app)

@app.route('/getEquation/<information>', methods = ['GET'])
def callGetEq(information):
	data = json.loads(information)
	return(getEquation(data["x"], data["y"], data["degree"]))

if __name__=='__main__':
	app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))


