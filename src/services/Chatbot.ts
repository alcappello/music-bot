import * as fs from 'fs';
import { LancasterStemmer, WordTokenizer } from 'natural';
import { Architect, Layer, Network, Trainer } from 'synaptic';

interface Intent {
    tag: string;
    patterns: string[];
    responses: string[];
}

interface Document {
    tag: string;
    words: string[];
}

interface Prediction {
    intent: Intent;
    probability: number;
}

export class Chatbot {

    public static defaultTrainingOptions: Trainer.TrainingOptions = {
        rate: .05,
        iterations: 50000,
        error: .005,
        shuffle: true,
        log: 1000,
        cost: Trainer.cost.CROSS_ENTROPY,
    };

    private static ignoredWords = ['?'];
    private static tokenizer = new WordTokenizer();

    private intents: Intent[];
    private documents: Document[] = [];
    private classes: string[] = [];
    private words: string[] = [];
    private trainingSet: Trainer.TrainingSet = [];
    private network: Architect.Perceptron;

    private static removeDuplicates(targetArray: string[]): string[] {

        return targetArray.filter((elem, index, self) => {
            return index === self.indexOf(elem) && elem !== undefined;
        });
    }

    private static tokenizeAndStem(sentence: string): string[] {

        const words = Chatbot.tokenizer.tokenize(sentence.toLowerCase());
        return words.map((word) => {
            if (Chatbot.ignoredWords.indexOf(word) === -1) {
                return LancasterStemmer.stem(word);
            }
        });
    }

    private static mapToBinaryArray(elements: string[] | string, refArray: string[]): number[] {
        if (typeof elements === 'string') {
            elements = [elements];
        }
        // Init the array to zeros
        const binaryArray: number[] = refArray.map(() => 0);
        // Set 1 for each match in the refArray
        elements.forEach((elem) => {
            const index = refArray.indexOf(elem);
            if (index >= 0) {
                binaryArray[index] = 1;
            }
        });

        return binaryArray;
    }

    public loadIntents(filePath: string): Promise<any> {

        return new Promise((resolve, reject) => {
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    reject(err);
                }

                this.intents = JSON.parse(data.toString()).intents as Intent[];

                this.readIntents();
                this.words = Chatbot.removeDuplicates(this.words).sort();
                this.classes = Chatbot.removeDuplicates(this.classes).sort();

                this.initTrainingSet();

                resolve();
            });
        });
    }

    public train(options: Trainer.TrainingOptions = Chatbot.defaultTrainingOptions): Trainer.TrainingResult {

        this.network = new Architect.Perceptron(this.words.length, 8, 8, this.classes.length);
        const trainer = new Trainer(this.network);

        return trainer.train(this.trainingSet, options);
    }

    public predict(sentence: string, errorThreshold = .25): Prediction[] {
        const predictions: Prediction[] = [];

        // Tokenize the sentence, stem it and transpose it to binary
        const newDoc = Chatbot.tokenizeAndStem(sentence);
        const newBinary = Chatbot.mapToBinaryArray(newDoc, this.words);
        // Predict using the network
        const responses = this.network.activate(newBinary);

        responses.forEach((res, index) => {
            if ((1 - res) < errorThreshold) {
                const tag = this.classes[index];
                predictions.push({intent: this.getIntentByTag(tag), probability: res});
            }
        });

        return predictions;
    }

    private initTrainingSet(): void {

        this.documents.forEach((doc) => {
            const trainingPair: Trainer.TrainingPair = { input: [], output: [] };
            // Create an array of zeros, then evaluate to 1 only where doc.words are present
            trainingPair.input = Chatbot.mapToBinaryArray(doc.words, this.words);
            trainingPair.output = Chatbot.mapToBinaryArray(doc.tag, this.classes);

            // Same procedure for the doc.tag
            trainingPair.output = this.classes.map(() => 0);
            trainingPair.output[this.classes.indexOf(doc.tag)] = 1;

            this.trainingSet.push(trainingPair);
        });
    }

    private readIntents(): void {

        this.intents.forEach((intent) => {
            intent.patterns.forEach((pattern) => {
                // Tokenize and stem each word in the sentence
                const wordsInPattern = Chatbot.tokenizeAndStem(pattern);
                this.words = this.words.concat(wordsInPattern);
                // Create a new document
                this.documents.push({tag: intent.tag, words: wordsInPattern});
                // Add the tag to the list, if it's not present
                if (this.classes.indexOf(intent.tag) === -1) {
                    this.classes.push(intent.tag);
                }
            });
        });
    }

    private getIntentByTag(tag: string): Intent {

        return this.intents.find((intent) => {
            return intent.tag === tag;
        });
    }
}
